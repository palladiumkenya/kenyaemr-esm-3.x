import { Form, Select, SelectItem } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useTimeSheets } from '../../../payment-points/payment-points.resource';
import styles from '../payment-history.scss';
import { usePaymentFilterContext } from '../usePaymentFilterContext';
import { usePaymentTransactionHistory } from '../usePaymentTransactionHistory';

const schema = z.object({
  timesheet: z.string(),
});

type FormData = z.infer<typeof schema>;

export const TimesheetsFilter = () => {
  const { filters, setFilters } = usePaymentFilterContext();
  const { bills } = usePaymentTransactionHistory(filters);
  const { cashiers } = filters;
  const { timesheets } = useTimeSheets();
  const billsCashierUUIDs = bills
    .map((bill) => bill.cashier)
    .filter((cashier) => cashiers.includes(cashier.uuid))
    .map((c) => c.uuid);

  const uniqueBillsCashiersUUIDS = Array.from(new Set(billsCashierUUIDs));
  const selectedCashiersTimesheets = timesheets
    .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
    .filter((sheet) => {
      return uniqueBillsCashiersUUIDS.includes(sheet.cashier.uuid);
    });

  const { t } = useTranslation();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      timesheet: undefined,
    },
  });

  const { register } = form;

  if (selectedCashiersTimesheets.length === 0) {
    return null;
  }

  return (
    <Form {...form}>
      <Select
        {...register('timesheet')}
        label={t('selectTimesheet', 'Select timesheet')}
        labelText={t('timesheet', 'Timesheet')}
        placeholder={t('filterByTimesheet', 'Filter by timesheet')}
        className={styles.timesheetsFilter}>
        <SelectItem value={undefined} text={'No timesheet'} />
        {selectedCashiersTimesheets.map((sheet) => (
          <SelectItem
            value={sheet.uuid}
            text={`${sheet.display} ${uniqueBillsCashiersUUIDS.length > 1 ? `(${sheet.cashier.display})` : ''}`}
          />
        ))}
      </Select>
    </Form>
  );
};
