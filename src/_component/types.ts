export interface Company {
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
  etatAdministratifUniteLegale?: string;
  apetEtablissement?: string;
  apenUniteLegale?: string;
  adresse: string;
}

export const API_KEY = import.meta.env.VITE_INSEE_API_KEY;

// liste des codes naf pour emmanuelle
export const validNafCodes = [
  "0141Z", "0142Z", "0143Z", "0145Z", "0149Z", "0150Z"
];
