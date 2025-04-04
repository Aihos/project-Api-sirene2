import React, { useState } from 'react';

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
  nomenclatureActivitePrincipaleEtablissement?: string;
  activitePrincipaleUniteLegale?: string;
  nomenclatureActivitePrincipaleUniteLegale?: string;
  apetEtablissement?: string;
  apenUniteLegale?: string;
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Valeurs par défaut pour les dates
  const today = new Date().toISOString().slice(0, 10);
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const [startDate, setStartDate] = useState(yearStart);
  const [endDate, setEndDate] = useState(today);

  const getSortedCompanies = () => {
    return [...recentCompanies].sort((a, b) => {
      const dateA = new Date(a.dateCreationUniteLegale).getTime();
      const dateB = new Date(b.dateCreationUniteLegale).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const handleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

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
      url += `&nombre=1000`;
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

  /* Partie Button excel */
  const exportToCSV = () => {
    if (recentCompanies.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }
  
    const csvHeader = [
      "SIREN",
      "SIRET",
      "Dénomination",
      "Date de création",
      "Catégorie",
      "Activité principale",
      "Adresse"
    ].join(";");
  
    const csvRows = recentCompanies.map(company => [
      company.siren,
      company.siret,
      company.denominationUniteLegale,
      company.dateCreationUniteLegale,
      company.categorieEntreprise,
      company.activitePrincipaleUniteLegale || "Non spécifiée",
      company.adresse.replace(/[\r\n]+/g, " ") // Éviter les sauts de ligne dans les champs
    ].join(";"));
  
    const csvContent = [csvHeader, ...csvRows].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "entreprises.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  return (
    <div className="min-h-screen bg-[#fff3ed] py-8 px-4">
      <div className="max-w-3/4 mx-auto p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-[#440706] mb-4 text-center">Recherche d'Entreprise</h1>

        <div className="flex flex-col justify-around align-middle items-center gap-2 mb-4 bg-white p-4 rounded-lg shadow-md border-2 border-[#ffc6a9]">
          <div className="grid grid-cols-2 gap-4 w-full">
            <label className="flex flex-col text-[#7d1611]">
              Date de début:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 border-2 border-[#ffc6a9] rounded-lg focus:ring-2 focus:ring-[#fc4413]"
              />
            </label>
            <label className="flex flex-col text-[#7d1611]">
              Date de fin:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 border-2 border-[#ffc6a9] rounded-lg focus:ring-2 focus:ring-[#fc4413]"
              />
            </label>
          </div>

          <div className="flex flex-col items-center gap-4 w-full">
            <button
              onClick={() => fetchRecentCompanies(true)}
              disabled={loading}
              className="w-1/3 px-4 py-2 bg-[#fd5f2b] text-white rounded-lg hover:bg-[#c41a0a] transition-colors disabled:opacity-50 font-semibold shadow-md"
            >
              {isInitialLoad ? 'Recherche en cours...' : 'Nouvelle recherche'}
            </button>

            {recentCompanies.length > 0 && (
              <div className="text-[#9c1710] text-sm font-medium">
                {recentCompanies.length} entreprises chargées
              </div>
            )}

            {hasMore && !isInitialLoad && (
              <button
                onClick={() => fetchRecentCompanies(false)}
                disabled={loading}
                className="px-4 py-2 bg-[#ffc6a9] text-[#7d1611] rounded-lg hover:bg-[#ff9d72] transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Chargement...' : 'Charger plus d\'entreprises'}
              </button>
            )}

            {!hasMore && recentCompanies.length > 0 && (
              <div className="text-[#9c1710] p-3 text-sm bg-[#fff3ed] rounded-full">
                Toutes les entreprises sont chargées
              </div>
            )}
          </div>
          <button
  onClick={exportToCSV}
  className="w-1/3 px-4 py-2 bg-[#fd5f2b] text-white rounded-lg hover:bg-[#c41a0a] transition-colors disabled:opacity-50 font-semibold shadow-md"
>
  Exporter en CSV
</button>

        </div>

        {error && <div className="bg-[#ffc6a9] text-[#7d1611] p-3 rounded-lg mb-4 font-medium">{error}</div>}

        {recentCompanies.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#9c1710] text-sm font-medium">
                {recentCompanies.length} entreprises chargées
              </div>
              <button
                onClick={handleSort}
                className="px-4 py-2 bg-[#ffc6a9] text-[#7d1611] rounded-lg hover:bg-[#ff9d72] transition-colors font-medium flex items-center gap-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                </svg>
                Trier par date ({sortOrder === 'asc' ? 'anciennes' : 'récentes'})
              </button>
            </div>

            <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {getSortedCompanies().map((company, index) => (
                <li key={index} className="bg-white p-3 rounded-lg shadow flex flex-col hover:shadow-lg transition duration-300 border-2 border-[#ffc6a9] hover:border-[#fc4413]">
                  <a href={`https://www.pappers.fr/entreprise/${company.siren}`} target="_blank" rel="noreferrer" className="flex flex-col gap-1 text-[#9c1710] hover:text-[#c41a0a]">
                    <span className="font-medium">{company.denominationUniteLegale}</span>
                    <span className="text-sm">SIREN : {company.siren} | SIRET : {company.siret}</span>
                  </a>
                  <span className="text-[#7d1611] text-sm mt-2">Créé le : {company.dateCreationUniteLegale}</span>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.adresse)}`} target="_blank" rel="noreferrer">
                    <span className="text-[#9c1710] text-sm underline hover:text-[#c41a0a]">Adresse : {company.adresse}</span>
                  </a>
                  <span className="text-[#7d1611] text-sm">Catégorie : {company.categorieEntreprise}</span>
                  <a className="flex flex-col gap-1 mt-2" href={'https://www.insee.fr/fr/metadonnees/nafr2/sousClasse/'+company.activitePrincipaleUniteLegale} target="_blank" rel="noreferrer">
                    <span className="text-[#fd5f2b] font-medium">Activité NAF : {company.activitePrincipaleUniteLegale}</span>
                    <span className="text-[#9c1710] text-xs">Nomenclature : {company.nomenclatureActivitePrincipaleUniteLegale}</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          !isInitialLoad && <p className="text-[#9c1710] italic text-center">Aucune entreprise trouvée pour cette période.</p>
        )}
      </div>
    </div>
  );
}

export default App;