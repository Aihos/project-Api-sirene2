import { useState } from 'react';
import { Company, API_KEY, validNafCodes } from './types';

export const useCompanySearch = () => {
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDepartment, setSelectedDepartment] = useState('53');

  // Valeurs par défaut pour les dates
  const today = new Date().toISOString().slice(0, 10);
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const [startDate, setStartDate] = useState(yearStart);
  const [endDate, setEndDate] = useState(today);

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
          etablissement.uniteLegale?.nomUsageUniteLegale ||
          `${etablissement.uniteLegale?.nomUniteLegale || ''} ${etablissement.uniteLegale?.prenom1UniteLegale || ''}`.trim() ||
          'Dénomination non disponible',
        dateCreationUniteLegale: etablissement.dateCreationEtablissement || '',
        categorieEntreprise: etablissement.uniteLegale?.categorieEntreprise || 'Non spécifiée',
        activitePrincipaleEtablissement: etablissement.activitePrincipaleEtablissement || '',
        nomenclatureActivitePrincipaleEtablissement: etablissement.activitePrincipaleEtablissement || '',
        activitePrincipaleUniteLegale: etablissement.uniteLegale?.activitePrincipaleUniteLegale || '',
        etatAdministratifUniteLegale: etablissement.uniteLegale?.etatAdministratifUniteLegale || 'Actif',
        nomenclatureActivitePrincipaleUniteLegale: etablissement.uniteLegale?.activitePrincipaleUniteLegale || '',
        apetEtablissement: etablissement.apet700 || '',
        nomUniteLegale: etablissement.uniteLegale?.nomUniteLegale || '',
        prenom1UniteLegale: etablissement.uniteLegale?.prenom1UniteLegale || '',
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
      "Nom unité légale",
      "Prénom 1 unité légale",
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
      company.nomUniteLegale || "",
      company.prenom1UniteLegale || "",
      company.dateCreationUniteLegale,
      company.adresse.replace(/[\r\n]+/g, " "),
      company.adresse.split(" ").slice(-2, -1).join(" "), // Code postal
      company.adresse.split(" ").slice(-1).join(" "), // Commune
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

  return {
    recentCompanies,
    loading,
    error,
    hasMore,
    isInitialLoad,
    sortOrder,
    selectedDepartment,
    setSelectedDepartment,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSort,
    fetchRecentCompanies,
    exportToCSV,
  };
};
