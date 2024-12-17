import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { DatePicker, DatePickerInput } from '@carbon/react';
import styles from './end-date.scss';

interface EndDatePickerProps {
  name: string;
  control: Control<any>;
  label?: string;
}

const EndDatePicker: React.FC<EndDatePickerProps> = ({ name, control, label }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker datePickerType="single" onChange={(e) => field.onChange(e[0])} className={styles.formDatePicker}>
          <DatePickerInput
            placeholder="mm/dd/yyyy"
            labelText={label || 'End Date'}
            id={`${name}-picker`}
            size="md"
            className={styles.formDatePicker}
            invalid={!!fieldState.error}
            invalidText={fieldState.error?.message}
          />
        </DatePicker>
      )}
    />
  );
};

export default EndDatePicker;
