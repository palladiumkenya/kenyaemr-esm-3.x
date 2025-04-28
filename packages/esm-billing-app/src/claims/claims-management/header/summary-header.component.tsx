import { DatePicker, DatePickerInput } from '@carbon/react';
import React, { useState, useEffect, useMemo } from 'react';
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

  const today = useMemo(() => new Date(), []);
  const sixMonthsAgo = useMemo(() => {
    const date = new Date(today);
    date.setMonth(today.getMonth() - 6);
    return date;
  }, [today]);

  useEffect(() => {
    if (!filters.fromDate && !filters.toDate) {
      onFilterChanged(() => ({
        fromDate: sixMonthsAgo,
        toDate: today,
      }));
    }
  }, [filters, onFilterChanged, sixMonthsAgo, today]);

  const handleDateChange = ([fromDate, toDate]: [Date, Date]) => {
    onFilterChanged(() => ({
      fromDate,
      toDate,
    }));
  };

  return (
    <div className={styles.summaryContainer}>
      <DatePicker
        datePickerType="range"
        value={[filters.fromDate, filters.toDate]}
        onChange={handleDateChange}
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
