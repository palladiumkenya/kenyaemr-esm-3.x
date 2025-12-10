import React from 'react';
import {
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
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { MappedBill, PaymentStatus } from '../../types';
import styles from '../../bills-table/bills-table.scss';
import BillLineItems from './bill-line-items.component';
import { ExtensionSlot } from '@openmrs/esm-framework';
import EmptyPatientBill from '../../past-patient-bills/patient-bills-dashboard/empty-patient-bill.component';
import { useCurrencyFormatting } from '../../helpers/currency';

type PatientBillsProps = {
  bills: Array<MappedBill>;
};

const PatientBills: React.FC<PatientBillsProps> = ({ bills }) => {
  const { t } = useTranslation();
  const { format: formatCurrency } = useCurrencyFormatting();

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
    totalAmount: formatCurrency(bill.totalAmount),
    status:
      bill.totalAmount === bill.tenderedAmount
        ? PaymentStatus.PAID
        : bill.tenderedAmount === 0
        ? PaymentStatus.PENDING
        : PaymentStatus.POSTED,
    amountPaid: formatCurrency(bill.tenderedAmount),
    ...(hasRefundedItems && {
      creditAmount: formatCurrency(
        bill.lineItems.filter((li) => Math.sign(li.price) === -1).reduce((acc, curr) => acc + Math.abs(curr.price), 0),
      ),
    }),
  }));

  if (bills.length === 0) {
    return (
      <div style={{ marginTop: '1rem' }}>
        <EmptyPatientBill
          title={t('noBillsFound', 'No bills found')}
          subTitle={t('noBillsFoundDescription', 'No bills found for this patient')}
        />
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
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
