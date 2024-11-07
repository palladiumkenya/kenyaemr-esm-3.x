import { DataTableSkeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBills } from '../../billing.resource';
import { MappedBill } from '../../types';
import { headers } from './payment-history-viewer.component';
import styles from './payment-history.scss';

export const PaymentHistoryTable = ({
  tableData,
  paidBillsResponse,
  renderedRows,
}: {
  tableData: any;
  paidBillsResponse: ReturnType<typeof useBills>;
  renderedRows: MappedBill[];
}) => {
  const { t } = useTranslation();
  const { bills, error, isLoading } = paidBillsResponse;
  const { rows, getHeaderProps, getRowProps, getTableProps } = tableData;

  if (isLoading) {
    return (
      <div className={styles.dataTableSkeleton}>
        <DataTableSkeleton
          headers={headers}
          aria-label="patient bills table"
          showToolbar={false}
          showHeader={false}
          columnCount={Object.keys(headers).length}
          zebra
          rowCount={3}
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

  if (bills.length === 0 || renderedRows.length === 0) {
    return (
      <div className={styles.emptyStateWrapper}>
        <EmptyState
          displayText={t('noBillsFilter', 'No bills match that filter please adjust your filters')}
          headerTitle={t('noBillsHeader', 'No bills match the provided filters')}
        />
      </div>
    );
  }

  return (
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
  );
};
