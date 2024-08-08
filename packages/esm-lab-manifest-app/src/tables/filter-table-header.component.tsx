import React from 'react';
import styles from './lab-manifest-table.scss';
import { Search } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface FilterTableHeaderProps {
  searchText?: string;
  onSearch?: (string: string) => void;
}

const FilterTableHeader: React.FC<FilterTableHeaderProps> = ({ onSearch, searchText = '' }) => {
  const { t } = useTranslation();
  return (
    <div>
      <Search
        placeholder={t('searchThisTable', 'Search this table')}
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
