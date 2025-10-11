import { useCompanySearch } from './_component/useCompanySearch';
import { SearchFilters } from './_component/SearchFilters';
import { SearchActions } from './_component/SearchActions';
import { CompanyList } from './_component/CompanyList';

function App() {
  const {
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
  } = useCompanySearch();
  
  return (
    <div className="min-h-screen bg-[#fff3ed] py-8 px-4">
      <div className="max-w-3/4 mx-auto p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-[#440706] mb-4 text-center">Recherche d'Entreprises</h1>
  
        <div className="flex flex-col justify-around items-center gap-2 mb-4 bg-white p-4 rounded-lg shadow-md border-2 border-[#ffc6a9]">
          <SearchFilters
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
  
          <SearchActions
            onNewSearch={() => fetchRecentCompanies(true)}
            onLoadMore={() => fetchRecentCompanies(false)}
            onExport={exportToCSV}
            loading={loading}
            isInitialLoad={isInitialLoad}
            hasMore={hasMore}
            companiesCount={recentCompanies.length}
          />
        </div>
  
        {error && <div className="bg-[#ffc6a9] text-[#7d1611] p-3 rounded-lg mb-4 font-medium">{error}</div>}
  
        <CompanyList
          companies={recentCompanies}
          sortOrder={sortOrder}
          onSort={handleSort}
          isInitialLoad={isInitialLoad}
        />
      </div>
    </div>
  );
}

export default App;
