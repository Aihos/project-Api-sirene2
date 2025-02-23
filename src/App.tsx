import React, { useState } from 'react';
import { Search, Building2, Calendar } from 'lucide-react';

interface Company {
  siren: string;
  siret: string;
  denominationUniteLegale: string;
  denominationUsuelle1UniteLegale?: string;
  denominationUsuelle2UniteLegale?: string;
  denominationUsuelle3UniteLegale?: string;
  nomUsageUniteLegale?: string;
  dateCreationUniteLegale: string;
  categorieEntreprise: string;
  activitePrincipaleEtablissement?: string;
  nomenclatureActivitePrincipaleEtablissement?: string; // Nouveau
  activitePrincipaleUniteLegale?: string; // Nouveau
  nomenclatureActivitePrincipaleUniteLegale?: string; // Nouveau
  apetEtablissement?: string; // Nouveau (Activité Principale Exercée de l'Etablissement)
  apenUniteLegale?: string; // Nouveau (Activité Principale Exercée de l'Unité Legale)
  adresse: string;
}

const API_KEY = "1a3d1061-7d89-4c64-bd10-617d89ac64cd";

function App() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [cursor, setCursor] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  // Valeurs par défaut pour les dates
  const today = new Date().toISOString().slice(0, 10);
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const [startDate, setStartDate] = useState(yearStart);
  const [endDate, setEndDate] = useState(today);

  const fetchRecentCompanies = async (reset = true) => {
    try {
      setLoading(true);
      setError('');
      if (reset) {
        setRecentCompanies([]);
        setCursor('');
        setHasMore(true);
        setIsInitialLoad(true);
      }

      let url = `https://api.insee.fr/api-sirene/3.11/siret?`;
      url += `q=dateCreationEtablissement:[${startDate} TO ${endDate}]`;
      url += ` AND codePostalEtablissement:53*`;
      url += `&etatAdministratifEtablissement=A`;
      url += `&nombre=1000`; // Taille de page réduite
      if (cursor) url += `&curseur=${encodeURIComponent(cursor)}`;

      const response = await fetch(url, {
        headers: {
          "X-INSEE-Api-Key-Integration": API_KEY,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const newCursor = data.header.curseurSuivant;
      
      const filteredEstabs = data.etablissements.filter((etab: any) => 
        etab.adresseEtablissement?.codePostalEtablissement?.startsWith("53")
      );

      const companies = filteredEstabs.map((etablissement: any) => ({
        siret: etablissement.siret || '',
        siren: etablissement.siren || '',
        denominationUniteLegale: etablissement.uniteLegale?.denominationUniteLegale || etablissement.uniteLegale?.denominationUsuelle1UniteLegale || etablissement.uniteLegale?.denominationUsuelle2UniteLegale || etablissement.uniteLegale?.denominationUsuelle3UniteLegale ||  etablissement.uniteLegale?.nomUsageUniteLegale || 'Nope pas de nom',
        dateCreationUniteLegale: etablissement.dateCreationEtablissement || '',
        categorieEntreprise: etablissement.uniteLegale?.categorieEntreprise || 'Non spécifiée',
        activitePrincipaleEtablissement: etablissement.activitePrincipaleEtablissement || '',
        nomenclatureActivitePrincipaleEtablissement: etablissement.activitePrincipaleEtablissement || '',
        activitePrincipaleUniteLegale: etablissement.uniteLegale?.activitePrincipaleUniteLegale || '',
        nomenclatureActivitePrincipaleUniteLegale: etablissement.uniteLegale?.activitePrincipaleUniteLegale || '',
        apetEtablissement: etablissement.apet700 || '',
        apenUniteLegale: etablissement.uniteLegale?.apen700 || '',
        adresse: `${etablissement.adresseEtablissement?.numeroVoieEtablissement || ''} ${etablissement.adresseEtablissement?.typeVoieEtablissement || ''} ${etablissement.adresseEtablissement?.libelleVoieEtablissement || ''} ${etablissement.adresseEtablissement?.codePostalEtablissement || ''} ${etablissement.adresseEtablissement?.libelleCommuneEtablissement || ''}`
      }));

      setRecentCompanies(prev => reset ? companies : [...prev, ...companies]);
      setCursor(newCursor);
      setHasMore(!!newCursor);
      setIsInitialLoad(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de récupération des données');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3/4 mx-auto p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Recherche d'Entreprise</h1>

        <div className="flex flex-col justify-around align-middle items-center gap-2 mb-4 bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              Date de début:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-lg"
              />
            </label>
            <label className="flex flex-col">
              Date de fin:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-lg"
              />
            </label>
          </div>

          <div className="flex flex-col items-center gap-4 w-full">
            <button
              onClick={() => fetchRecentCompanies(true)}
              disabled={loading}
              className="w-1/3 px-4 py-2 bg-white text-black outline rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              {isInitialLoad ? 'Recherche en cours...' : 'Nouvelle recherche'}
            </button>

            {recentCompanies.length > 0 && (
              <div className="text-gray-600 text-sm">
                {recentCompanies.length} entreprises chargées
              </div>
            )}

            {hasMore && !isInitialLoad && (
              <button
                onClick={() => fetchRecentCompanies(false)}
                disabled={loading}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Charger plus d\'entreprises'}
              </button>
            )}

            {!hasMore && recentCompanies.length > 0 && (
              <div className="text-green-600 p-3 text-sm">
                Toutes les entreprises sont chargées
              </div>
            )}
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

        {recentCompanies.length > 0 ? (
          <>
            <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {recentCompanies.map((company, index) => (
                <li key={index} className="bg-white p-3 rounded-lg shadow flex flex-col hover:shadow-lg transition duration-300">
                  <a href={`https://www.pappers.fr/entreprise/${company.siren}`} target="_blank" rel="noreferrer" className="flex flex-col gap-1 underline text-gray-900 hover:text-blue-500">
                    <span className="font-medium">{company.denominationUniteLegale}</span>
                    <span className="text-sm">SIREN : {company.siren} | SIRET : {company.siret}</span>
                  </a>
                  <span className="text-gray-500 text-sm mt-2">Créé le : {company.dateCreationUniteLegale}</span>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.adresse)}`} target="_blank" rel="noreferrer">
                    <span className="text-gray-500 text-sm underline hover:text-black">Adresse : {company.adresse}</span>
                  </a>
                  <span className="text-gray-500 text-sm">Catégorie : {company.categorieEntreprise}</span>
                 {/*  <span className="text-gray-500 text-sm">Activité : {company.activitePrincipaleEtablissement}</span> */}
              {/*     <span className="text-gray-500 text-sm">Activité NAF : {company.nomenclatureActivitePrincipaleEtablissement}</span> */}
              <a className="flex flex-col gap-1 underline text-gray-900 hover:text-blue-500" href={'https://www.insee.fr/fr/metadonnees/nafr2/sousClasse/'+company.activitePrincipaleUniteLegale} target="_blank" rel="noreferrer">
                 <span className="font-medium">Activité NAF : {company.activitePrincipaleUniteLegale}</span>
                  <span className="font-medium">Activité NAF : {company.nomenclatureActivitePrincipaleUniteLegale}</span>
              </a>
                 
                  {/* <span className="text-gray-500 text-sm">APE : {company.apetEtablissement}</span>
                  <span className="text-gray-500 text-sm">APE NAF : {company.apenUniteLegale}</span> */}
                  
                </li>
              ))}
            </ul>
          </>
        ) : (
          !isInitialLoad && <p className="text-gray-500 italic">Aucune entreprise trouvée pour cette période.</p>
        )}
      </div>
    </div>
  );
}

export default App;