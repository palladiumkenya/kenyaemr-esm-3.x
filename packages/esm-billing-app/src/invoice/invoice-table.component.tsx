import React from 'react';
import { useParams } from 'react-router-dom';
import {
  DataTable,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableHeader,
  TableCell,
} from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { useBills } from '../billing.resource';
import styles from './invoice-table.scss';

type InvoiceTableProps = {};

const InvoiceTable: React.FC<InvoiceTableProps> = () => {
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { bills } = useBills('');
  const params = useParams();
  const patientBills = bills?.filter((bill) => bill.patientUuid === params?.patientUuid) ?? [];
  const headerData = [
    { header: 'No', key: 'no' },
    { header: 'Bill item', key: 'billItem' },
    { header: 'Bill code', key: 'billCode' },
    { header: 'Status', key: 'status' },
    { header: 'Quantity', key: 'quantity' },
    { header: 'Price', key: 'price' },
    { header: 'Total', key: 'total' },
  ];

  const rowData = patientBills.map((bill, index) => {
    return {
      no: `${index + 1}`,
      id: `${bill.uuid}`,
      billItem: bill.lineItems.flatMap((bill) => bill.item).join(' '),
      billCode: bill.receiptNumber,
      status: bill.status,
      quantity: bill.lineItems.flatMap((item) => item.quantity).reduce((prev, curr) => prev + curr, 0),
      price: bill.lineItems.flatMap((item) => item.price).reduce((prev, curr) => prev + curr, 0),
      total: bill.lineItems.map((bill) => bill.price * bill.quantity).reduce((prev, curr) => prev + curr, 0),
    };
  });

  return (
    <div className={styles.invoiceContainer}>
      <DataTable
        isSortable
        rows={rowData}
        headers={headerData}
        size={responsiveSize}
        useZebraStyles={rowData?.length > 1 ? true : false}>
        {({ rows, headers, getRowProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()} aria-label="Invoice line items">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key}>{header.header}</TableHeader>
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
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default InvoiceTable;
