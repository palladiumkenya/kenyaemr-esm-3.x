import React, { useEffect, useState } from 'react';
import { useBills, usePaymentModes } from '../../billing.resource';
import {
  DataTable,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Pagination,
} from '@carbon/react';
import styles from './payment-history.scss';
import { TableToolBarDateRangePicker } from './table-toolbar-date-range';
import flatMapDeep from 'lodash-es/flatMapDeep';
import { MappedBill, PaymentStatus } from '../../types';
import dayjs from 'dayjs';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { PaymentHistoryTable } from './payment-history-table.component';
import { PaymentTotals } from './payment-totals';
import { CashierFilter } from './cashier-filter';
import { PaymentTypeFilter } from './payment-type-filter';

export const headers = [
  { header: 'date', key: 'dateCreated' },
  { header: 'Patient Name', key: 'patientName' },
  { header: 'status', key: 'status' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Service', key: 'billingService' },
];

const PaymentHistoryViewer = () => {
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

  const [selectedPaymentTypeCheckBoxes, setSelectedPaymentTypeCheckBoxes] = useState<string[]>([]);
  const [selectedCashierCheckboxes, setSelectedCashierCheckboxes] = useState<string[]>([]);

  const responsiveSize = isDesktop(useLayoutType()) ? 'sm' : 'lg';

  useEffect(() => {
    if (bills.length > 0 && renderedRows === null) {
      setRenderedRows(bills);
    }
  }, [bills, renderedRows]);

  const handleFilterByDateRange = (dates: Date[]) => {
    setDateRange(dates);
  };

  const getAllValues = (obj: Object) => {
    return flatMapDeep(obj, (value) => {
      if (typeof value === 'object' && value !== null) {
        return getAllValues(value);
      }
      return value;
    });
  };

  const onApplyCashierFilter = (appliedCheckboxes: Array<string>) => {
    setSelectedCashierCheckboxes(selectedCashierCheckboxes);
    if (appliedCheckboxes.length === 0) {
      setRenderedRows(bills);
      return;
    }

    setRenderedRows([]);
    for (let i = 0; i < appliedCheckboxes.length; i++) {
      // Filter the items inside the rows list
      const filteredRows = bills.filter((row) => {
        const rowValues: string[] = getAllValues(row);
        return rowValues.some((value) => String(value).toLowerCase().includes(appliedCheckboxes[i].toLowerCase()));
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

  const onApplyPaymentTypeFilter = (appliedCheckboxes: Array<string>) => {
    setSelectedPaymentTypeCheckBoxes(appliedCheckboxes);
    if (appliedCheckboxes.length === 0) {
      setRenderedRows(bills);
      return;
    }

    setRenderedRows([]);
    for (let i = 0; i < appliedCheckboxes.length; i++) {
      // Filter the items inside the rows list
      const filteredRows = bills.filter((row) => {
        const rowValues: string[] = getAllValues(row);
        return rowValues.some((value) => String(value).toLowerCase().includes(appliedCheckboxes[i].toLowerCase()));
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

  const handleOnResetCashierFilter = () => {
    setRenderedRows(bills);
  };

  const handleOnResetPaymentTypeFilter = () => {
    setRenderedRows(bills);
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
                  <PaymentTypeFilter
                    onApplyFilter={onApplyPaymentTypeFilter}
                    onResetFilter={handleOnResetPaymentTypeFilter}
                  />
                  <CashierFilter
                    bills={bills}
                    onApplyFilter={onApplyCashierFilter}
                    onResetFilter={handleOnResetCashierFilter}
                  />
                  <TableToolBarDateRangePicker onChange={handleFilterByDateRange} currentValues={dateRange} />
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <PaymentHistoryTable tableData={tableData} paidBillsResponse={paidBillsResponse} />
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
      <PaymentTotals renderedRows={renderedRows} selectedPaymentTypeCheckBoxes={selectedPaymentTypeCheckBoxes} />
    </div>
  );
};

export default PaymentHistoryViewer;
