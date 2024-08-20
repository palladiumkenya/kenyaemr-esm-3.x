import { DatePicker, DatePickerInput } from '@carbon/react';
import React from 'react';
import styles from './bill-summary.scss';

export const TableToolBarDateRangePicker = ({ onChange }: { onChange: (dates: Date[]) => void }) => {
  return (
    <DatePicker datePickerType="range" className={styles.dateRangePicker} onChange={onChange}>
      <DatePickerInput id="date-picker-input-id-start" placeholder="mm/dd/yyyy" labelText="Start date" size="md" />
      <DatePickerInput id="date-picker-input-id-finish" placeholder="mm/dd/yyyy" labelText="End date" size="md" />
    </DatePicker>
  );
};
