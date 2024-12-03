import React from 'react';
import {
  Layer,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
  Tile,
  Button,
} from '@carbon/react';
import { convertToCurrency } from '../../helpers';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { MappedBill, PaymentStatus } from '../../types';
import styles from '../../bills-table/bills-table.scss';
import BillLineItems from './bill-line-items.component';
import { Scalpel, ShoppingCartMinus, TrashCan } from '@carbon/react/icons';
import { ExtensionSlot, launchWorkspace, showModal } from '@openmrs/esm-framework';

type PatientBillsProps = {
  bills: Array<MappedBill>;
};

const PatientBills: React.FC<PatientBillsProps> = ({ bills }) => {
  const { t } = useTranslation();

  const hasRefundedItems = bills.some((bill) => bill.lineItems.some((li) => Math.sign(li.price) === -1));

  const tableHeaders = [
    { header: 'Date', key: 'date' },
    { header: 'Status', key: 'status' },
    { header: 'Total Amount', key: 'totalAmount' },
    { header: 'Amount Paid', key: 'amountPaid' },
  ];

  if (hasRefundedItems) {
    tableHeaders.splice(2, 0, { header: 'Refunded Amount', key: 'creditAmount' });
  }

  const tableRows = bills.map((bill) => ({
    id: `${bill.uuid}`,
    date: bill.dateCreated,
    totalAmount: convertToCurrency(bill.totalAmount),
    status:
      bill.totalAmount === bill.tenderedAmount
        ? PaymentStatus.PAID
        : bill.tenderedAmount === 0
        ? PaymentStatus.PENDING
        : PaymentStatus.POSTED,
    amountPaid: convertToCurrency(bill.tenderedAmount),
    ...(hasRefundedItems && {
      creditAmount: convertToCurrency(
        bill.lineItems.filter((li) => Math.sign(li.price) === -1).reduce((acc, curr) => acc + Math.abs(curr.price), 0),
      ),
    }),
  }));

  if (bills.length === 0) {
    return (
      <div style={{ marginTop: '1rem' }}>
        <EmptyState
          displayText={t('noBillDisplay', 'There are no bills to display for this patient')}
          headerTitle="No bills"
        />
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        compact
        size="sm"
        useZebraStyles
        render={({
          rows,
          headers,
          getHeaderProps,
          getExpandHeaderProps,
          getRowProps,
          getExpandedRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            title={t('patientBills', 'Patient bill')}
            description={t('patientBillsDescription', 'List of patient bills')}
            {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  <TableExpandHeader {...getExpandHeaderProps()} />
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <TableCell>
                        <ExtensionSlot
                          name="bill-actions-slot"
                          style={{ display: 'flex', gap: '0.5rem' }}
                          state={{ bill: bills[index] }}
                        />
                      </TableCell>
                    </TableExpandRow>
                    <TableExpandedRow
                      colSpan={headers.length + 2}
                      className={styles.expendableRow}
                      {...getExpandedRowProps({
                        row,
                      })}>
                      <BillLineItems bill={bills[index]} />
                    </TableExpandedRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    </div>
  );
};

export default PatientBills;
