import { Search } from '@carbon/react';
import React, { useState } from 'react';
import styles from './admitted-queue-header.scss';

const DeceasedFilter: React.FC<{ onSearchChange: (searchQuery: string) => void }> = ({ onSearchChange }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  return (
    <div className={styles.metricsContainer}>
      <Search
        size="sm"
        placeholder="Search for deceased"
        labelText="Search"
        closeButtonLabelText="Clear search input"
        id="search-deceased"
        onChange={handleSearchChange}
        value={searchQuery}
        className={styles.searchInput}
      />
    </div>
  );
};

export default DeceasedFilter;
