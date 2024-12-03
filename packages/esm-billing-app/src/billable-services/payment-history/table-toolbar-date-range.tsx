import { DatePicker, DatePickerInput } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './payment-history.scss';

export const TableToolBarDateRangePicker = ({
  onChange,
  currentValues,
}: {
  onChange: (dates: Array<Date>) => void;
  currentValues: Array<Date>;
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
        maxDate={currentDate.toISOString()}
      />
      <DatePickerInput
        id="date-picker-input-id-finish"
        placeholder="mm/dd/yyyy"
        labelText={t('endDate', 'End date')}
        size="md"
        maxDate={currentDate.toISOString()}
      />
    </DatePicker>
  );
};
