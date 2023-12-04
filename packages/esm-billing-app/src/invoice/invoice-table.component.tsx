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
  DataTableSkeleton,
} from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { useBill } from '../billing.resource';
import styles from './invoice-table.scss';

type InvoiceTableProps = {};

const InvoiceTable: React.FC<InvoiceTableProps> = () => {
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const params = useParams();
  const { bill, isLoading } = useBill(params?.billUuid);
  const headerData = [
    { header: 'No', key: 'no' },
    { header: 'Bill item', key: 'billItem' },
    { header: 'Bill code', key: 'billCode' },
    { header: 'Status', key: 'status' },
    { header: 'Quantity', key: 'quantity' },
    { header: 'Price', key: 'price' },
    { header: 'Total', key: 'total' },
  ];

  const rowData = bill?.lineItems?.map((item, index) => {
    return {
      no: `${index + 1}`,
      id: `${item.uuid}`,
      billItem: item.item,
      billCode: bill.receiptNumber,
      status: bill.status,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    };
  });

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton
          showHeader={false}
          showToolbar={false}
          zebra
          columnCount={headerData?.length}
          size={responsiveSize}
        />
      </div>
    );
  }

  return (
    <div className={styles.invoiceContainer}>
      <DataTable isSortable rows={rowData} headers={headerData} size={responsiveSize} useZebraStyles={true}>
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
