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
  nomUniteLegale?: string;
  pseudonymeUniteLegale?: string;
  prenom1UniteLegale?: string;
  prenom2UniteLegale?: string;
  prenom3UniteLegale?: string;
  prenom4UniteLegale?: string;
  prenomUsuelUniteLegale?: string;
  adresse: string;
}

export const API_KEY = import.meta.env.VITE_INSEE_API_KEY;

// liste des codes naf pour emmanuelle
export const validNafCodes = [
 /*  "0141Z", "0142Z", "0143Z", "0145Z", "0149Z", "0150Z" */
 "4211Z", "4212Z", "4213A", "4213B", "4221Z", "4222Z", "4291Z", "4299Z",
  "4311Z", "4312A", "4312B", "4313Z", "4399C", "4399D", "4399E"
];
