import { Select, SelectItem } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useTimeSheets } from '../../payment-points/payment-points.resource';
import { MappedBill, Timesheet } from '../../types';

const schema = z.object({
  timesheet: z.string(),
});

type FormData = z.infer<typeof schema>;

export const TimesheetsFilter = ({
  appliedFilters,
  bills,
  applyTimeSheetFilter,
}: {
  appliedFilters: Array<string>;
  bills: MappedBill[];
  applyTimeSheetFilter: (sheet: Timesheet) => void;
}) => {
  const billCashiers = bills.map((bill) => bill.cashier.uuid);
  const selectedCashiers = appliedFilters.filter((filter) => billCashiers.includes(filter));
  const { timesheets } = useTimeSheets();
  const selectedCashiersTimesheets = timesheets.filter((sheet) => selectedCashiers.includes(sheet.cashier.uuid));

  const { t } = useTranslation();
  const { register, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const selectedSheetUUID = watch('timesheet');

  useEffect(() => {
    if (selectedSheetUUID) {
      applyTimeSheetFilter(timesheets.find((sheet) => sheet.uuid === selectedSheetUUID));
    }
  }, [applyTimeSheetFilter, selectedSheetUUID, timesheets]);

  if (selectedCashiersTimesheets.length === 0) {
    return null;
  }

  return (
    <Select
      {...register('timesheet')}
      labelText={t('selectCashier', 'Select cashier')}
      label={t('cashier', 'Cashier')}
      placeholder={t('filterByTimesheet', 'Filter by timesheet')}>
      {selectedCashiersTimesheets.map((sheet) => (
        <SelectItem value={sheet.uuid} text={sheet.display} />
      ))}
    </Select>
  );
};
