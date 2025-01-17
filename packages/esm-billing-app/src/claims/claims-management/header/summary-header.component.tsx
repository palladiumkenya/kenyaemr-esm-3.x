import { DatePicker, DatePickerInput } from '@carbon/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './summary-header.scss';

interface ClaimsSummaryHeaderProps {
  filters: {
    fromDate: Date | null;
    toDate: Date | null;
  };
  onFilterChanged: (updateFn: (currentFilters: any) => any) => void;
  statusOptions?: string[];
}

const ClaimSummaryHeader: React.FC<ClaimsSummaryHeaderProps> = ({ filters, onFilterChanged }) => {
  const { t } = useTranslation();

  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  useEffect(() => {
    if (!filters.fromDate && !filters.toDate) {
      onFilterChanged(() => ({
        fromDate: oneMonthAgo,
        toDate: today,
      }));
    }
  }, [filters, onFilterChanged, oneMonthAgo, today]);

  return (
    <div className={styles.summaryContainer}>
      <DatePicker
        datePickerType="range"
        value={[filters.fromDate, filters.toDate]}
        onChange={([fromDate, toDate]) =>
          onFilterChanged((currentFilters) => ({ ...currentFilters, fromDate, toDate }))
        }
        aria-label={t('datePicker.rangeLabel', 'Select date range')}>
        <DatePickerInput
          id="date-picker-input-id-start"
          placeholder={t('datePicker.startPlaceholder', 'mm/dd/yyyy')}
          size="md"
          labelText={t('datePicker.startLabel', 'Start Date')}
        />
        <DatePickerInput
          id="date-picker-input-id-finish"
          placeholder={t('datePicker.endPlaceholder', 'mm/dd/yyyy')}
          size="md"
          labelText={t('datePicker.endLabel', 'End Date')}
        />
      </DatePicker>
    </div>
  );
};

export default ClaimSummaryHeader;
