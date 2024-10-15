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
  Button,
} from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useNavigate } from 'react-router-dom';

const headers = [
  { header: 'Name', key: 'name' },
  { header: 'Description', key: 'description' },
  { header: 'Action', key: 'action' },
];

export const PaymentPointsTable = () => {
  const { paymentPoints, error, isLoading } = usePaymentPoints();
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    <DataTable rows={paymentPoints} headers={headers}>
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
                    <TableCell key={cell.id}>
                      {cell.info.header === 'action' ? (
                        <Button onClick={() => navigate(`/payment-points/${row.id}`)} kind="tertiary">
                          View
                        </Button>
                      ) : (
                        cell.value
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};
