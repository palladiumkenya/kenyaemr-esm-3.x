import { DatePicker, DatePickerInput } from '@carbon/react';
import React from 'react';
import styles from './bill-summary.scss';

export const TableToolBarDateRangePicker = ({
  onChange,
  currentValues,
}: {
  onChange: (dates: Date[]) => void;
  currentValues: Date[];
}) => {
  const currentDate = new Date();
  return (
    <DatePicker
      datePickerType="range"
      className={styles.dateRangePicker}
      onClose={onChange}
      maxDate={currentDate.toISOString()}
      value={currentValues}>
      <DatePickerInput id="date-picker-input-id-start" placeholder="mm/dd/yyyy" labelText="Start date" size="md" />
      <DatePickerInput id="date-picker-input-id-finish" placeholder="mm/dd/yyyy" labelText="End date" size="md" />
    </DatePicker>
  );
};
