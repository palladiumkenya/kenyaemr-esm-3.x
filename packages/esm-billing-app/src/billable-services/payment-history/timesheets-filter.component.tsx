import { Form, Select, SelectItem } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useTimeSheets } from '../../payment-points/payment-points.resource';
import { MappedBill, Timesheet } from '../../types';
import styles from './payment-history.scss';

const schema = z.object({
  timesheet: z.string(),
});

type FormData = z.infer<typeof schema>;

export const TimesheetsFilter = ({
  appliedFilters,
  bills,
  applyTimeSheetFilter,
  dateRange,
}: {
  appliedFilters: Array<string>;
  bills: MappedBill[];
  applyTimeSheetFilter: (sheet: Timesheet | undefined) => void;
  dateRange: Array<Date>;
}) => {
  const { timesheets } = useTimeSheets();
  const billsCashierUUIDs = bills
    .map((bill) => bill.cashier)
    .filter((cashier) => appliedFilters.includes(cashier.display))
    .map((c) => c.uuid);

  const uniqueBillsCashiersUUIDS = Array.from(new Set(billsCashierUUIDs));

  const selectedCashiersTimesheets = timesheets
    .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
    .filter((sheet) => uniqueBillsCashiersUUIDS.includes(sheet.cashier.uuid))
    .filter((sheet) => {
      const sheetClockInTime = new Date(sheet.clockIn);
      const isOpenTimeSheet = !sheet.clockOut;
      if (isOpenTimeSheet) {
        return sheetClockInTime >= dateRange.at(0);
      }
      const sheetClockOutTime = new Date(sheet.clockOut);
      return sheetClockInTime >= dateRange.at(0) && sheetClockOutTime <= dateRange.at(1);
    });

  const { t } = useTranslation();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      timesheet: undefined,
    },
  });

  const { register, watch } = form;
  const selectedSheetUUID = watch('timesheet');

  useEffect(() => {
    if (!selectedSheetUUID) {
      applyTimeSheetFilter(undefined);
      return;
    }
    if (selectedSheetUUID) {
      applyTimeSheetFilter(timesheets.find((sheet) => sheet.uuid === selectedSheetUUID));
    }
  }, [selectedSheetUUID]);

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
