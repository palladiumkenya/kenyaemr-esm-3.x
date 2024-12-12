import { DatePicker, DatePickerInput } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../payment-history.scss';
import { usePaymentFilterContext } from '../usePaymentFilterContext';

export const DateRangeFilter = () => {
  const { t } = useTranslation();
  const { dateRange, setDateRange } = usePaymentFilterContext();

  const handleDateRangeChange = ([start, end]: Array<Date>) => {
    if (start && end) {
      setDateRange([start, end]);
    }
  };

  return (
    <DatePicker
      maxDate={new Date()}
      datePickerType="range"
      className={styles.dateRangePicker}
      value={[...dateRange]}
      onChange={handleDateRangeChange}>
      <DatePickerInput
        id="date-picker-input-id-start"
        placeholder="mm/dd/yyyy"
        labelText={t('startDate', 'Start date')}
        size="md"
      />
      <DatePickerInput
        id="date-picker-input-id-finish"
        placeholder="mm/dd/yyyy"
        labelText={t('endDate', 'End date')}
        size="md"
      />
    </DatePicker>
  );
};
