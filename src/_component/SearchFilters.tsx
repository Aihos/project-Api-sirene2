import React from 'react';
import { DepartmentSelector } from './DepartmentSelector';

interface SearchFiltersProps {
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <DepartmentSelector 
        value={selectedDepartment}
        onChange={setSelectedDepartment}
      />
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
  );
};
