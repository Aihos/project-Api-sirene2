import React from 'react';
import { Company } from './types';
import { CompanyCard } from './CompanyCard';

interface CompanyListProps {
  companies: Company[];
  sortOrder: 'asc' | 'desc';
  onSort: () => void;
  isInitialLoad: boolean;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  sortOrder,
  onSort,
  isInitialLoad,
}) => {
  const getSortedCompanies = () => {
    return [...companies].sort((a, b) => {
      const dateA = new Date(a.dateCreationUniteLegale).getTime();
      const dateB = new Date(b.dateCreationUniteLegale).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  if (companies.length === 0 && !isInitialLoad) {
    return (
      <p className="text-[#9c1710] italic text-center">
        Aucune entreprise trouvée pour cette période.
      </p>
    );
  }

  if (companies.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[#9c1710] text-sm font-medium">
          {companies.length} entreprises chargées
        </div>
        <button
          onClick={onSort}
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
          <CompanyCard key={index} company={company} />
        ))}
      </ul>
    </>
  );
};
