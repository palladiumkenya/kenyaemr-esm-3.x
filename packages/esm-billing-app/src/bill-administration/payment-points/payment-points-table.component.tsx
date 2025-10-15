import React from 'react';
import { usePaymentPoints } from './payment-points.resource';
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
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { ErrorState, navigate, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

const headers = [
  { header: 'Name', key: 'name' },
  { header: 'Description', key: 'description' },
];

export const PaymentPointsTable = () => {
  const { paymentPoints, error, isLoading } = usePaymentPoints();
  const { t } = useTranslation();
  const layout = useLayoutType();

  if (isLoading) {
    return (
      <DataTableSkeleton
        headers={headers}
        showToolbar={false}
        showHeader={false}
        columnCount={Object.keys(headers).length}
        zebra
        rowCount={3}
      />
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('errorLoadingPaymentPoints', 'Error loading payment points')} />;
  }

  if (paymentPoints.length === 0) {
    return (
      <EmptyState
        displayText={t('noCashPointsConfigured', 'There are no cash points configured for this location')}
        headerTitle={t('noCashPoints', 'No Cash Points')}
      />
    );
  }

  return (
    <DataTable rows={paymentPoints} size={layout === 'tablet' ? 'md' : 'sm'} headers={headers}>
      {({ getTableProps, getHeaderProps, rows, getRowProps }) => (
        <TableContainer>
          <Table {...getTableProps()}>
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
                <TableHeader aria-label={t('overflowMenu', 'Overflow menu')} />
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
                  <TableCell className="cds--table-column-menu">
                    <OverflowMenu size="sm" flipped>
                      <OverflowMenuItem
                        itemText={t('view', 'View')}
                        onClick={() => navigate({ to: `\${openmrsSpaBase}/payment-points/${row.id}` })}
                      />
                    </OverflowMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};
