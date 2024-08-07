import React from 'react';
import styles from './lab-manifest-table.scss';
import { Search } from '@carbon/react';

interface FilterTableHeaderProps {
  searchText?: string;
  onSearch?: (string: string) => void;
}

const FilterTableHeader: React.FC<FilterTableHeaderProps> = ({ onSearch, searchText = '' }) => {
  return (
    <div>
      <Search
        placeholder="Search this table"
        onClear={() => {
          onSearch('');
        }}
        value={searchText}
        onChange={({ target: { value } }) => {
          onSearch(value);
        }}
      />
    </div>
  );
};

export default FilterTableHeader;
