import React, { useEffect, useState } from 'react';
import { usePaidBills } from '../../billing.resource';
import {
  DataTableSkeleton,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import styles from './bill-summary.scss';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { TableToolbarFilter } from './table-toolbar-filter';
import { TableToolBarDateRangePicker } from './table-toolbar-date-range';
import flatMapDeep from 'lodash-es/flatMapDeep';
import { MappedBill } from '../../types';
import dayjs from 'dayjs';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

export const headers = [
  { header: 'date', key: 'dateCreated' },
  { header: 'Patient Name', key: 'patientName' },
  { header: 'status', key: 'status' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Service', key: 'billingService' },
];

const BillSummary = () => {
  const [renderedRows, setRenderedRows] = useState<null | MappedBill[]>(null);
  const [dateRange, setDateRange] = useState<Date[]>([dayjs().startOf('day').toDate(), new Date()]);
  const [hasLoadedForTheFirstTime, setHasLoadedForTheFirstTime] = useState(false);
  const { bills, isLoading, error, isValidating } = usePaidBills(dateRange[0], dateRange[1]);

  useEffect(() => {
    if (bills.length >= 0 && renderedRows === null) {
      setRenderedRows(bills);
      setHasLoadedForTheFirstTime(true);
    }
  }, [bills, renderedRows]);

  const { t } = useTranslation();

  const getAllValues = (obj: Object) => {
    return flatMapDeep(obj, (value) => {
      if (typeof value === 'object' && value !== null) {
        return getAllValues(value);
      }
      return value;
    });
  };

  const handleTableFilter = (selectedCheckboxes: Array<string>) => {
    setRenderedRows([]);
    for (let i = 0; i < selectedCheckboxes.length; i++) {
      // Filter the items inside the rows list
      const filteredRows = bills.filter((row) => {
        const rowValues: string[] = getAllValues(row);
        return rowValues.some((value) => String(value).toLowerCase().includes(selectedCheckboxes[i].toLowerCase()));
      });

      setRenderedRows((prevData) => {
        // Filter out duplicate rows
        const uniqueRows = filteredRows.filter((row) => {
          return !prevData.some((prevRow) => {
            return Object.keys(row).every((key) => {
              return row[key] === prevRow[key];
            });
          });
        });
        return [...prevData, ...uniqueRows];
      });
    }
  };

  const handleOnResetFilter = () => {
    setRenderedRows(bills);
  };

  const handleFilterByDateRange = (dates: Date[]) => {
    setDateRange(dates);
  };

  if ((isLoading && !hasLoadedForTheFirstTime) || renderedRows === null) {
    return (
      <div className={styles.dataTableSkeleton}>
        <DataTableSkeleton
          headers={headers}
          aria-label="patient bills table"
          showToolbar={false}
          showHeader={false}
          rowCount={3}
          zebra
          columnCount={3}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorStateSkeleton}>
        <ErrorState error={error} headerTitle={t('paidBillsErrorState', 'An error occurred fetching bills')} />
      </div>
    );
  }

  return (
    <div className={styles.table}>
      <DataTable rows={renderedRows} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, onInputChange }) => (
          <TableContainer title="Paid Bills" description="Paid Bills Summary">
            <div className={styles.tableToolBar}>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch onChange={(evt: React.ChangeEvent<HTMLInputElement>) => onInputChange(evt)} />
                  <TableToolbarFilter onApplyFilter={handleTableFilter} onResetFilter={handleOnResetFilter} />
                  <TableToolBarDateRangePicker onChange={handleFilterByDateRange} />
                </TableToolbarContent>
              </TableToolbar>
            </div>
            {isValidating ? (
              <div className={styles.dataTableSkeleton}>
                <DataTableSkeleton
                  headers={headers}
                  aria-label="patient bills table"
                  showToolbar={false}
                  showHeader={false}
                  rowCount={3}
                  zebra
                  columnCount={3}
                />
              </div>
            ) : bills.length === 0 ? (
              <div className={styles.emptyStateWrapper}>
                <EmptyState
                  displayText={t('noBillsFilter', 'No bills match that filter please adjust your filters')}
                  headerTitle={t('noBillsHeader', 'No bills match the provided filters')}
                />
              </div>
            ) : (
              <Table {...getTableProps()} aria-label="sample table">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        key={header.key}
                        {...getHeaderProps({
                          header,
                        })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default BillSummary;
