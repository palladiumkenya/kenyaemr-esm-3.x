import React, { useEffect, useState } from 'react';
import { useBills } from '../../billing.resource';
import {
  DataTable,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
} from '@carbon/react';
import styles from './bill-summary.scss';
import { TableToolbarFilter } from './table-toolbar-filter';
import { TableToolBarDateRangePicker } from './table-toolbar-date-range';
import flatMapDeep from 'lodash-es/flatMapDeep';
import { MappedBill, PaymentStatus } from '../../types';
import dayjs from 'dayjs';
import { BillSummaryTable } from './bill-summary-table.component';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

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
  const paidBillsResponse = useBills('', PaymentStatus.PAID, dateRange[0], dateRange[1]);
  const { bills } = paidBillsResponse;

  const [pageSize, setPageSize] = useState(10);
  const { paginated, goTo, results, currentPage } = usePagination(renderedRows ?? [], pageSize);
  const { pageSizes } = usePaginationInfo(
    pageSize,
    renderedRows ? renderedRows.length : 0,
    currentPage,
    results?.length,
  );
  const { t } = useTranslation();

  const responsiveSize = isDesktop(useLayoutType()) ? 'sm' : 'lg';

  useEffect(() => {
    if (bills.length > 0 && renderedRows === null) {
      setRenderedRows(bills);
    }
  }, [bills, renderedRows]);

  const getAllValues = (obj: Object) => {
    return flatMapDeep(obj, (value) => {
      if (typeof value === 'object' && value !== null) {
        return getAllValues(value);
      }
      return value;
    });
  };

  const handlePaymentTypeFilter = (selectedCheckboxes: Array<string>) => {
    if (selectedCheckboxes.length === 0) {
      setRenderedRows(bills);
      return;
    }

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

  return (
    <div className={styles.table}>
      <DataTable rows={results ?? []} headers={headers} isSortable>
        {(tableData) => (
          <TableContainer title="Paid Bills" description="Paid Bills Summary">
            <div className={styles.tableToolBar}>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => tableData.onInputChange(evt)}
                  />
                  <TableToolbarFilter onApplyFilter={handlePaymentTypeFilter} onResetFilter={handleOnResetFilter} />
                  <TableToolBarDateRangePicker onChange={handleFilterByDateRange} currentValues={dateRange} />
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <BillSummaryTable tableData={tableData} paidBillsResponse={paidBillsResponse} />
            {paginated && (
              <Pagination
                forwardText={t('nextPage', 'Next page')}
                backwardText={t('previousPage', 'Previous page')}
                page={currentPage}
                pageSize={pageSize}
                pageSizes={pageSizes}
                totalItems={bills.length}
                className={styles.pagination}
                size={responsiveSize}
                onChange={({ page: newPage, pageSize }) => {
                  if (newPage !== currentPage) {
                    goTo(newPage);
                  }
                  setPageSize(pageSize);
                }}
              />
            )}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default BillSummary;
