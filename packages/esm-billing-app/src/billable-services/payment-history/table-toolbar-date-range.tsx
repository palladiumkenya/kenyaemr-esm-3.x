import { DatePicker, DatePickerInput } from '@carbon/react';
import React from 'react';
import styles from './payment-history.scss';
import { useTranslation } from 'react-i18next';

export const TableToolBarDateRangePicker = ({
  onChange,
  currentValues,
}: {
  onChange: (dates: Date[]) => void;
  currentValues: Date[];
}) => {
  const currentDate = new Date();
  const { t } = useTranslation();
  return (
    <DatePicker
      datePickerType="range"
      className={styles.dateRangePicker}
      onClose={onChange}
      maxDate={currentDate.toISOString()}
      value={currentValues}>
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
