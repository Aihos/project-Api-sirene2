import React from 'react';
import { Company } from './types';

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <li className="bg-white p-3 rounded-lg shadow flex flex-col hover:shadow-lg transition duration-300 border-2 border-[#ffc6a9] hover:border-[#fc4413]">
      <a 
        href={`https://www.pappers.fr/entreprise/${company.siren}`} 
        target="_blank" 
        rel="noreferrer" 
        className="flex flex-col gap-1 text-[#9c1710] hover:text-[#c41a0a]"
      >
        <span className="font-medium">{company.denominationUniteLegale}</span>
        <span className="text-sm">SIREN : {company.siren} | SIRET : {company.siret}</span>
        <span className="text-sm">État : {company.etatAdministratifUniteLegale || 'pas donnée'}</span>
        <span>Nom et prénom : {company.prenom1UniteLegale} {company.nomUniteLegale}</span>
      </a>
      <span className="text-[#7d1611] text-sm mt-2">Créé le : {company.dateCreationUniteLegale}</span>
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.adresse)}`} 
        target="_blank" 
        rel="noreferrer"
      >
        <span className="text-[#9c1710] text-sm underline hover:text-[#c41a0a]">
          Adresse : {company.adresse}
        </span>
      </a>
      <span className="text-[#7d1611] text-sm">Catégorie : {company.categorieEntreprise}</span>
      <a 
        className="flex flex-col gap-1 mt-2" 
        href={'https://www.insee.fr/fr/metadonnees/nafr2/sousClasse/' + company.activitePrincipaleUniteLegale} 
        target="_blank" 
        rel="noreferrer"
      >
        <span className="text-[#fd5f2b] font-medium">
          Activité NAF : {company.activitePrincipaleUniteLegale}
        </span>
        <span className="text-[#9c1710] text-xs">
          Nomenclature : {company.nomenclatureActivitePrincipaleUniteLegale}
        </span>
      </a>
    </li>
  );
};
