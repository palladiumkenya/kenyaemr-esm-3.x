import { DatePicker, DatePickerInput, Dropdown, Search, Button } from '@carbon/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ClaimsPreAuthFilter } from '../../../types';
import styles from './filter-header.scss';
import { showModal } from '@openmrs/esm-framework';

type ClaimsFilterHeaderProps = {
  filters: ClaimsPreAuthFilter;
  onFilterChanged: React.Dispatch<React.SetStateAction<ClaimsPreAuthFilter>>;
  statusOptions?: Array<{ value: string; label: string }>;
  filteredClaimIds?: Array<string>;
};

const ClaimsFilterHeader: React.FC<ClaimsFilterHeaderProps> = ({
  filters,
  onFilterChanged,
  statusOptions: status = [],
  filteredClaimIds = [],
}) => {
  const { t } = useTranslation();

  const handleUpdateAllStatuses = () => {
    const dispose = showModal('manage-claim-request-modal', {
      closeModal: () => dispose(),
      multipleIds: filteredClaimIds,
      modalType: 'all',
    });
  };
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
      <Button kind="primary" onClick={handleUpdateAllStatuses} disabled={filteredClaimIds.length === 0}>
        {t('updateAllStatuses', 'Update All')}
      </Button>
    </div>
  );
};

export default ClaimsFilterHeader;
