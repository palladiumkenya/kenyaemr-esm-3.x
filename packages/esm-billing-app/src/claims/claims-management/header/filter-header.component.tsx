import { DatePicker, DatePickerInput, Dropdown, Search } from '@carbon/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClaimsPreAuthFilter } from '../../../types';
import styles from './filter-header.scss';

type ClaimsFilterHeaderProps = {
  filters: ClaimsPreAuthFilter;
  onFilterChanged: React.Dispatch<React.SetStateAction<ClaimsPreAuthFilter>>;
  statusOptions?: Array<{ value: string; label: string }>;
};

const ClaimsFilterHeader: React.FC<ClaimsFilterHeaderProps> = ({
  filters,
  onFilterChanged,
  statusOptions: status = [],
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.filterContainer}>
      <Search
        placeholder={t('searchPLaceHolder', 'Search by provider or patient')}
        onChange={({ target: { value } }) => onFilterChanged((fil) => ({ ...fil, search: value }))}
        value={filters.search}
      />
      <Dropdown
        className={styles.input}
        id="status"
        onChange={({ selectedItem }) => {
          onFilterChanged((fil) => ({ ...fil, status: selectedItem }));
        }}
        initialSelectedItem={filters.status}
        label={t('preauthStatus', 'Filter by Status')}
        items={status.map((s) => s.value)}
        itemToString={(item) => status.find((s) => s.value === item)?.label ?? ''}
      />
      <DatePicker
        datePickerType="range"
        value={[filters.fromDate, filters.toDate]}
        onChange={([fromDate, toDate]) => onFilterChanged((fil) => ({ ...fil, fromDate, toDate }))}>
        <DatePickerInput id="date-picker-input-id-start" placeholder="mm/dd/yyyy" size="md" />
        <DatePickerInput id="date-picker-input-id-finish" placeholder="mm/dd/yyyy" size="md" />
      </DatePicker>
    </div>
  );
};

export default ClaimsFilterHeader;
