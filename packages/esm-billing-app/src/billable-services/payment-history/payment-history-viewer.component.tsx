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
import { AppliedFilterTags } from './applied-filter-tages.component';

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
    setSelectedCashierCheckboxes(appliedCheckboxes);

    if (appliedCheckboxes.length === 0) {
      // No cashier filter applied
      if (selectedPaymentTypeCheckBoxes.length === 0) {
        setRenderedRows(bills); // No filters applied
      } else {
        // Only payment type filter is applied
        const filteredByPaymentType = bills.filter((row) => {
          const rowValues: string[] = getAllValues(row);
          return selectedPaymentTypeCheckBoxes.some((paymentType) =>
            rowValues.some((value) => String(value).toLowerCase().includes(paymentType.toLowerCase())),
          );
        });
        setRenderedRows(filteredByPaymentType);
      }
      return;
    }

    // Apply cashier filter
    let filteredRows = bills.filter((row) => {
      const rowValues: string[] = getAllValues(row);
      return appliedCheckboxes.some((cashier) =>
        rowValues.some((value) => String(value).toLowerCase().includes(cashier.toLowerCase())),
      );
    });

    // If payment type filter is also applied
    if (selectedPaymentTypeCheckBoxes.length > 0) {
      filteredRows = filteredRows.filter((row) => {
        const rowValues: string[] = getAllValues(row);
        return selectedPaymentTypeCheckBoxes.some((paymentType) =>
          rowValues.some((value) => String(value).toLowerCase().includes(paymentType.toLowerCase())),
        );
      });
    }

    setRenderedRows(filteredRows);
  };

  const onApplyPaymentTypeFilter = (appliedCheckboxes: Array<string>) => {
    setSelectedPaymentTypeCheckBoxes(appliedCheckboxes);

    if (appliedCheckboxes.length === 0) {
      // No payment type filter applied
      if (selectedCashierCheckboxes.length === 0) {
        setRenderedRows(bills); // No filters applied
      } else {
        // Only cashier filter is applied
        const filteredByCashier = bills.filter((row) => {
          const rowValues: string[] = getAllValues(row);
          return selectedCashierCheckboxes.some((cashier) =>
            rowValues.some((value) => String(value).toLowerCase().includes(cashier.toLowerCase())),
          );
        });
        setRenderedRows(filteredByCashier);
      }
      return;
    }

    // Apply payment type filter
    let filteredRows = bills.filter((row) => {
      const rowValues: string[] = getAllValues(row);
      return appliedCheckboxes.some((paymentType) =>
        rowValues.some((value) => String(value).toLowerCase().includes(paymentType.toLowerCase())),
      );
    });

    // If cashier filter is also applied
    if (selectedCashierCheckboxes.length > 0) {
      filteredRows = filteredRows.filter((row) => {
        const rowValues: string[] = getAllValues(row);
        return selectedCashierCheckboxes.some((cashier) =>
          rowValues.some((value) => String(value).toLowerCase().includes(cashier.toLowerCase())),
        );
      });
    }

    setRenderedRows(filteredRows);
  };

  const handleOnResetCashierFilter = () => {
    setSelectedCashierCheckboxes([]);

    if (selectedPaymentTypeCheckBoxes.length === 0) {
      setRenderedRows(bills);
    } else {
      let filteredRows = bills;

      for (let i = 0; i < selectedPaymentTypeCheckBoxes.length; i++) {
        const selectedPaymentType = selectedPaymentTypeCheckBoxes[i];

        filteredRows = filteredRows.filter((row) => {
          const rowValues: string[] = getAllValues(row);
          return rowValues.some((value) => String(value).toLowerCase().includes(selectedPaymentType.toLowerCase()));
        });
      }

      setRenderedRows(filteredRows);
    }
  };

  const handleOnResetPaymentTypeFilter = () => {
    setSelectedPaymentTypeCheckBoxes([]);

    if (selectedCashierCheckboxes.length === 0) {
      setRenderedRows(bills);
    } else {
      let filteredRows = bills;

      for (let j = 0; j < selectedCashierCheckboxes.length; j++) {
        const selectedCashier = selectedCashierCheckboxes[j];

        filteredRows = filteredRows.filter((row) => {
          const rowValues: string[] = getAllValues(row);
          return rowValues.some((value) => String(value).toLowerCase().includes(selectedCashier.toLowerCase()));
        });
      }

      setRenderedRows(filteredRows);
    }
  };

  const cashierTags = selectedCashierCheckboxes.map((c) => {
    return {
      tag: c,
      type: 'Cashier',
    };
  });

  const paymentTypeTags = selectedPaymentTypeCheckBoxes.map((t) => {
    return {
      tag: t,
      type: 'Payment Type',
    };
  });

  return (
    <div className={styles.table}>
      <DataTable rows={results ?? []} headers={headers} isSortable>
        {(tableData) => (
          <TableContainer
            title={t('paidBills', 'Paid Bills')}
            description={t('paidBillsSummary', 'Paid Bills Summary')}>
            <div className={styles.tableToolBar}>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => tableData.onInputChange(evt)}
                  />
                  <AppliedFilterTags tags={[...cashierTags, ...paymentTypeTags]} />
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
