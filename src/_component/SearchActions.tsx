import React from 'react';

interface SearchActionsProps {
  onNewSearch: () => void;
  onLoadMore: () => void;
  onExport: () => void;
  loading: boolean;
  isInitialLoad: boolean;
  hasMore: boolean;
  companiesCount: number;
}

export const SearchActions: React.FC<SearchActionsProps> = ({
  onNewSearch,
  onLoadMore,
  onExport,
  loading,
  isInitialLoad,
  hasMore,
  companiesCount,
}) => {
  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          onClick={onNewSearch}
          disabled={loading}
          className="w-1/3 px-4 py-2 bg-[#fd5f2b] text-white rounded-lg hover:bg-[#c41a0a] transition-colors disabled:opacity-50 font-semibold shadow-md"
        >
          {isInitialLoad ? 'Recherche en cours...' : 'Nouvelle recherche'}
        </button>

        {companiesCount > 0 && (
          <div className="text-[#9c1710] text-sm font-medium">
            {companiesCount} entreprises chargées
          </div>
        )}

        {hasMore && !isInitialLoad && (
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-[#ffc6a9] text-[#7d1611] rounded-lg hover:bg-[#ff9d72] transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? 'Chargement...' : 'Charger plus d\'entreprises'}
          </button>
        )}

        {!hasMore && companiesCount > 0 && (
          <div className="text-[#9c1710] p-3 text-sm bg-[#fff3ed] rounded-full">
            Toutes les entreprises sont chargées
          </div>
        )}
      </div>
      <button
        onClick={onExport}
        className="w-1/3 px-4 py-2 bg-[#fd5f2b] text-white rounded-lg hover:bg-[#c41a0a] transition-colors disabled:opacity-50 font-semibold shadow-md"
      >
        Exporter en CSV
      </button>
    </>
  );
};
