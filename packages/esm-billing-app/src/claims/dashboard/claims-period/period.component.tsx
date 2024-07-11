import React, { useState } from 'react';
import { Button, DatePicker, DatePickerInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import styles from './period.scss';
import dayjs from 'dayjs';

type FormValues = {
  startDate: Date | null;
  endDate: Date | null;
};
interface ClaimsPeriodProps {
  onSetDateRange: (startDate: string | null, endDate: string | null) => void;
}

const ClaimsPeriod: React.FC<ClaimsPeriodProps> = ({ onSetDateRange }) => {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      startDate: null,
      endDate: null,
    },
  });

  const onSubmit = (data: FormValues) => {
    const { startDate, endDate } = data;

    if (startDate && endDate) {
      onSetDateRange(dayjs(startDate).startOf('day').toISOString(), dayjs(endDate).startOf('day').toISOString());
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.rowContainer}>
      <div>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DatePicker dateFormat="m/d/Y" datePickerType="single" onChange={(e: any) => field.onChange(e[0])}>
              <DatePickerInput id="start-date" placeholder="mm/dd/yyyy" labelText={t('startDate', 'Start Date')} />
            </DatePicker>
          )}
        />
      </div>
      <div>
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <DatePicker dateFormat="m/d/Y" datePickerType="single" onChange={(e: any) => field.onChange(e[0])}>
              <DatePickerInput id="end-date" placeholder="mm/dd/yyyy" labelText={t('endDate', 'End Date')} />
            </DatePicker>
          )}
        />
      </div>
      <div>
        <Button kind="ghost" type="submit">
          {t('loadClaims', 'Load claims')}
        </Button>
      </div>
    </form>
  );
};

export default ClaimsPeriod;
