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
  etatAdministratifUniteLegale?: string; //nouveau champ
  apetEtablissement?: string;
 /*  trancheEffectifsEtablissement?: string; */
  apenUniteLegale?: string;
  adresse: string;
}

const API_KEY = "1a3d1061-7d89-4c64-bd10-617d89ac64cd";

// Définition de la liste des codes NAF autorisés
/* const validNafCodes = [
  "0111Z", "0112Z", "0113Z", "0114Z", "0115Z", "0116Z", "0119Z",
  "0121Z", "0122Z", "0123Z", "0124Z", "0125Z", "0126Z", "0127Z", "0128Z", "0129Z",
  "0130Z", "0141Z", "0142Z", "0143Z", "0144Z", "0145Z", "0146Z", "0147Z", "0149Z",
  "0150Z", "0161Z", "0162Z", "0163Z", "0164Z", "0170Z", "0210Z", "0220Z", "0230Z",
  "8130Z"
]; */

// liste des codees naf pour emmanuelle
const validNafCodes = [
  "0141Z", "0142Z", "0143Z", "0145Z", "0149Z", "0150Z"
];

function App() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [cursor, setCursor] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDepartment, setSelectedDepartment] = useState('53'); // Département par défaut

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

      // Construire l'URL avec les filtres sur la date et le code postal uniquement.
      let url = `https://api.insee.fr/api-sirene/3.11/siret?`;
      url += `q=dateCreationEtablissement:[${startDate} TO ${endDate}]`;
      url += `AND codePostalEtablissement:${selectedDepartment}*`;
      url += `&etatAdministratifEtablissement=A`;
      url += `&nombre=10000`;
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
      
      // Fonction pour normaliser une valeur de code NAF : suppression du point et mise en majuscules.
      const normalize = (val: string | undefined) =>
        val ? val.replace('.', '').toUpperCase() : '';

      // Filtrage côté client : conserver uniquement les établissements dont le code postal commence par le département sélectionné
      // et dont l'une des valeurs (activitePrincipaleEtablissement ou uniteLegale.activitePrincipaleUniteLegale)
      // fait partie de validNafCodes.
      const filteredEstabs = data.etablissements.filter((etab: any) => {
        const validPostal = etab.adresseEtablissement?.codePostalEtablissement?.startsWith(selectedDepartment);
        const nafEtab = normalize(etab.activitePrincipaleEtablissement);
        const nafUnite = normalize(etab.uniteLegale?.activitePrincipaleUniteLegale);
        return validPostal &&
          ( validNafCodes.includes(nafEtab) || validNafCodes.includes(nafUnite) );
      });

      const companies = filteredEstabs.map((etablissement: any) => ({
        siret: etablissement.siret || '',
        siren: etablissement.siren || '',
        denominationUniteLegale: etablissement.uniteLegale?.denominationUniteLegale ||
          etablissement.uniteLegale?.denominationUsuelle1UniteLegale ||
          etablissement.uniteLegale?.denominationUsuelle2UniteLegale ||
          etablissement.uniteLegale?.denominationUsuelle3UniteLegale ||
          etablissement.uniteLegale?.nomUsageUniteLegale || 'Nom non défini',
        dateCreationUniteLegale: etablissement.dateCreationEtablissement || '',
        categorieEntreprise: etablissement.uniteLegale?.categorieEntreprise || 'Non spécifiée',
        activitePrincipaleEtablissement: etablissement.activitePrincipaleEtablissement || '',
        /* trancheEffectifsEtablissement: etablissement.trancheEffectifsEtablissement || '', */
        nomenclatureActivitePrincipaleEtablissement: etablissement.activitePrincipaleEtablissement || '',
        activitePrincipaleUniteLegale: etablissement.uniteLegale?.activitePrincipaleUniteLegale || '',
        etatAdministratifUniteLegale: etablissement.uniteLegale?.etatAdministratifUniteLegale || 'Actif',
        nomenclatureActivitePrincipaleUniteLegale: etablissement.uniteLegale?.activitePrincipaleUniteLegale || '',
        apetEtablissement: etablissement.apet700 || '',
        apenUniteLegale: etablissement.uniteLegale?.apen700 || '',
        adresse: `${etablissement.adresseEtablissement?.numeroVoieEtablissement || ''} ${etablissement.adresseEtablissement?.typeVoieEtablissement || ''} ${etablissement.adresseEtablissement?.libelleVoieEtablissement || ''} ${etablissement.adresseEtablissement?.codePostalEtablissement || ''} ${etablissement.adresseEtablissement?.libelleCommuneEtablissement || ''}`
      }));

      setRecentCompanies(reset ? companies : [...recentCompanies, ...companies]);
      setCursor(newCursor);
      setHasMore(!!newCursor);
      setIsInitialLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de récupération des données');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (recentCompanies.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }
  
    const csvHeader = [
      "Unite Legale",
      "SIREN",
      "SIRET",
      "Dénomination",
      "Date de création",
      "Adresse",
      "Code postal",
      "Commune",
      "tranche effectifs",
      "Code NAF"
    ].join(";");
  
    const csvRows = recentCompanies.map(company => [
      company.etatAdministratifUniteLegale,
      company.siren,
      company.siret,
      company.denominationUniteLegale,
      company.dateCreationUniteLegale,
      company.adresse.replace(/[\r\n]+/g, " "),
      company.adresse.split(" ").slice(-2, -1).join(" "), // Code postal
      company.adresse.split(" ").slice(-1).join(" "), // Commune
   /*    company.trancheEffectifsEtablissement || "Non spécifiée", */
      company.activitePrincipaleUniteLegale || "Non spécifiée"
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

 console.log("recentCompanies", recentCompanies);
  
  return (
    <div className="min-h-screen bg-[#fff3ed] py-8 px-4">
      <div className="max-w-3/4 mx-auto p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-[#440706] mb-4 text-center">Recherche d'Entreprises</h1>
  
        <div className="flex flex-col justify-around items-center gap-2 mb-4 bg-white p-4 rounded-lg shadow-md border-2 border-[#ffc6a9]">
          <div className="grid grid-cols-3 gap-4 w-full">
            <label className="flex flex-col text-[#7d1611]">
              Département:
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-2 py-1 border-2 border-[#ffc6a9] rounded-lg focus:ring-2 focus:ring-[#fc4413]"
              >
                <option value="01">01 - Ain</option>
                <option value="02">02 - Aisne</option>
                <option value="03">03 - Allier</option>
                <option value="04">04 - Alpes-de-Haute-Provence</option>
                <option value="05">05 - Hautes-Alpes</option>
                <option value="06">06 - Alpes-Maritimes</option>
                <option value="07">07 - Ardèche</option>
                <option value="08">08 - Ardennes</option>
                <option value="09">09 - Ariège</option>
                <option value="10">10 - Aube</option>
                <option value="11">11 - Aude</option>
                <option value="12">12 - Aveyron</option>
                <option value="13">13 - Bouches-du-Rhône</option>
                <option value="14">14 - Calvados</option>
                <option value="15">15 - Cantal</option>
                <option value="16">16 - Charente</option>
                <option value="17">17 - Charente-Maritime</option>
                <option value="18">18 - Cher</option>
                <option value="19">19 - Corrèze</option>
                <option value="21">21 - Côte-d'Or</option>
                <option value="22">22 - Côtes-d'Armor</option>
                <option value="23">23 - Creuse</option>
                <option value="24">24 - Dordogne</option>
                <option value="25">25 - Doubs</option>
                <option value="26">26 - Drôme</option>
                <option value="27">27 - Eure</option>
                <option value="28">28 - Eure-et-Loir</option>
                <option value="29">29 - Finistère</option>
                <option value="30">30 - Gard</option>
                <option value="31">31 - Haute-Garonne</option>
                <option value="32">32 - Gers</option>
                <option value="33">33 - Gironde</option>
                <option value="34">34 - Hérault</option>
                <option value="35">35 - Ille-et-Vilaine</option>
                <option value="36">36 - Indre</option>
                <option value="37">37 - Indre-et-Loire</option>
                <option value="38">38 - Isère</option>
                <option value="39">39 - Jura</option>
                <option value="40">40 - Landes</option>
                <option value="41">41 - Loir-et-Cher</option>
                <option value="42">42 - Loire</option>
                <option value="43">43 - Haute-Loire</option>
                <option value="44">44 - Loire-Atlantique</option>
                <option value="45">45 - Loiret</option>
                <option value="46">46 - Lot</option>
                <option value="47">47 - Lot-et-Garonne</option>
                <option value="48">48 - Lozère</option>
                <option value="49">49 - Maine-et-Loire</option>
                <option value="50">50 - Manche</option>
                <option value="51">51 - Marne</option>
                <option value="52">52 - Haute-Marne</option>
                <option value="53">53 - Mayenne</option>
                <option value="54">54 - Meurthe-et-Moselle</option>
                <option value="55">55 - Meuse</option>
                <option value="56">56 - Morbihan</option>
                <option value="57">57 - Moselle</option>
                <option value="58">58 - Nièvre</option>
                <option value="59">59 - Nord</option>
                <option value="60">60 - Oise</option>
                <option value="61">61 - Orne</option>
                <option value="62">62 - Pas-de-Calais</option>
                <option value="63">63 - Puy-de-Dôme</option>
                <option value="64">64 - Pyrénées-Atlantiques</option>
                <option value="65">65 - Hautes-Pyrénées</option>
                <option value="66">66 - Pyrénées-Orientales</option>
                <option value="67">67 - Bas-Rhin</option>
                <option value="68">68 - Haut-Rhin</option>
                <option value="69">69 - Rhône</option>
                <option value="70">70 - Haute-Saône</option>
                <option value="71">71 - Saône-et-Loire</option>
                <option value="72">72 - Sarthe</option>
                <option value="73">73 - Savoie</option>
                <option value="74">74 - Haute-Savoie</option>
                <option value="75">75 - Paris</option>
                <option value="76">76 - Seine-Maritime</option>
                <option value="77">77 - Seine-et-Marne</option>
                <option value="78">78 - Yvelines</option>
                <option value="79">79 - Deux-Sèvres</option>
                <option value="80">80 - Somme</option>
                <option value="81">81 - Tarn</option>
                <option value="82">82 - Tarn-et-Garonne</option>
                <option value="83">83 - Var</option>
                <option value="84">84 - Vaucluse</option>
                <option value="85">85 - Vendée</option>
                <option value="86">86 - Vienne</option>
                <option value="87">87 - Haute-Vienne</option>
                <option value="88">88 - Vosges</option>
                <option value="89">89 - Yonne</option>
                <option value="90">90 - Territoire de Belfort</option>
                <option value="91">91 - Essonne</option>
                <option value="92">92 - Hauts-de-Seine</option>
                <option value="93">93 - Seine-Saint-Denis</option>
                <option value="94">94 - Val-de-Marne</option>
                <option value="95">95 - Val-d'Oise</option>
              </select>
            </label>
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
                    <span className="text-sm">État : {company.etatAdministratifUniteLegale || 'pas donnée'}</span>
                  </a>
                  <span className="text-[#7d1611] text-sm mt-2">Créé le : {company.dateCreationUniteLegale}</span>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.adresse)}`} target="_blank" rel="noreferrer">
                    <span className="text-[#9c1710] text-sm underline hover:text-[#c41a0a]">Adresse : {company.adresse}</span>
                  </a>
                  <span className="text-[#7d1611] text-sm">Catégorie : {company.categorieEntreprise}</span>
                {/*   <span className="text-[#7d1611] text-sm">Tranche effectifs : {company.trancheEffectifsEtablissement || 'Non spécifiée'}</span> */}
                  <a className="flex flex-col gap-1 mt-2" href={'https://www.insee.fr/fr/metadonnees/nafr2/sousClasse/' + company.activitePrincipaleUniteLegale} target="_blank" rel="noreferrer">
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
