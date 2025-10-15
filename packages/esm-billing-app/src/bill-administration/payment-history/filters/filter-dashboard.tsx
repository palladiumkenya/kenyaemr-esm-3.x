import React from 'react';
import { Filter } from './filter.component';
import { TimesheetsFilter } from './timesheets-filter.component';
import { DateRangeFilter } from './date-ranger-filter.component';
import styles from './filter-dashboard.scss';

export const FilterDashboard = () => {
  return (
    <div className={styles.filterDashboard}>
      <div className={styles.filterContainer}>
        <DateRangeFilter />
        <Filter />
        <TimesheetsFilter />
      </div>
    </div>
  );
};
