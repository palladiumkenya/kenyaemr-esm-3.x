import { ComboBox, Search } from '@carbon/react';
import React, { useState } from 'react';
import styles from './admitted-queue-header.scss';

const DeceasedFilter: React.FC = () => {
  const items = [
    { id: 'all', text: 'All' },
    { id: 'male', text: 'Male' },
    { id: 'female', text: 'Female' },
    { id: 'children', text: 'Children' },
  ];

  const [selectedItem, setSelectedItem] = useState(items[0]);

  const handleChange = (selected) => {
    setSelectedItem(selected.selectedItem);
  };

  return (
    <div className={styles.metricsContainer}>
      <Search
        size="sm"
        placeholder="Search for deceased"
        labelText="Search"
        closeButtonLabelText="Clear search input"
        id="search-deceased"
        onChange={() => {}}
        onKeyDown={() => {}}
        className={styles.searchInput}
      />
      <div className={styles.actionBtn}>
        <ComboBox
          onChange={handleChange}
          id="filter"
          items={items}
          className={styles.comboBox}
          size="sm"
          itemToString={(item) => (item ? item.text : '')}
          initialSelectedItem={items[0]}
        />
      </div>
    </div>
  );
};

export default DeceasedFilter;
