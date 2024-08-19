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

const headers = [
  { header: 'date', key: 'dateCreated' },
  { header: 'Patient Name', key: 'patientName' },
  { header: 'status', key: 'status' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Service', key: 'billingService' },
];

const BillSummary = () => {
  const { bills, isLoading, error } = usePaidBills();
  const [renderedRows, setRenderedRows] = useState(bills);

  useEffect(() => {
    if (renderedRows.length === 0 && bills.length > 1) {
      setRenderedRows(bills);
    }
  }, [bills, renderedRows.length]);

  const { t } = useTranslation();

  if (isLoading) {
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

  const handleTableFilter = (selectedCheckboxes) => {
    setRenderedRows([]);
    for (let i = 0; i < selectedCheckboxes.length; i++) {
      // Filter the items inside the rows list
      const filteredRows = bills.filter((row) => {
        return Object.values(row).some((value) =>
          String(value).toLowerCase().includes(selectedCheckboxes[i].toLowerCase()),
        );
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

  return (
    <div className={styles.table}>
      <DataTable rows={bills} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, onInputChange }) => (
          <TableContainer title="DataTable" description="With filtering">
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch onChange={(evt: React.ChangeEvent<HTMLInputElement>) => onInputChange(evt)} />
                <TableToolbarFilter onApplyFilter={handleTableFilter} onResetFilter={handleOnResetFilter} />
              </TableToolbarContent>
            </TableToolbar>
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
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default BillSummary;
