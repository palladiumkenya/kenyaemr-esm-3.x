import {
  Button,
  DataTable,
  Pagination,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import { isDesktop, showModal, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';
import flatMapDeep from 'lodash-es/flatMapDeep';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useBills } from '../../billing.resource';
import { useClockInStatus, usePaymentPoints } from '../../payment-points/payment-points.resource';
import { MappedBill, PaymentStatus } from '../../types';
import { AppliedFilterTags } from './applied-filter-tages.component';
import { CashierFilter } from './cashier-filter';
import { PaymentHistoryTable } from './payment-history-table.component';
import styles from './payment-history.scss';
import { PaymentTotals } from './payment-totals';
import { PaymentTypeFilter } from './payment-type-filter';
import { TableToolBarDateRangePicker } from './table-toolbar-date-range';

export const headers = [
  { header: 'Date', key: 'dateCreated' },
  { header: 'Patient Name', key: 'patientName' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Service', key: 'billingService' },
];

export const PaymentHistoryViewer = () => {
  const [renderedRows, setRenderedRows] = useState<null | MappedBill[]>(null);
  const [dateRange, setDateRange] = useState<Date[]>([dayjs().startOf('day').toDate(), new Date()]);
  const { paymentPointUUID } = useParams();
  const { paymentPoints } = usePaymentPoints();
  const { isClockedIn } = useClockInStatus(paymentPointUUID);

  const isOnPaymentPointPage = Boolean(paymentPointUUID);
  const paidBillsResponse = useBills('', isOnPaymentPointPage ? '' : PaymentStatus.PAID, dateRange[0], dateRange[1]);
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
      if (isOnPaymentPointPage) {
        const filteredByCashPoint = bills.filter((bill) => bill.cashPointUuid === paymentPointUUID);
        setRenderedRows(filteredByCashPoint);
      } else {
        setRenderedRows(bills);
      }
    }
  }, [bills, isOnPaymentPointPage, paymentPointUUID, renderedRows]);

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
    goTo(1);
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
    goTo(1);
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
    goTo(1);
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

    goTo(1);
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

  const openClockInModal = () => {
    const dispose = showModal('clock-in-modal', {
      closeModal: () => dispose(),
      paymentPoint: paymentPoints.find((paymentPoint) => paymentPoint.uuid === paymentPointUUID),
    });
  };

  const openClockOutModal = () => {
    const dispose = showModal('clock-out-modal', {
      closeModal: () => dispose(),
      paymentPoint: paymentPoints.find((paymentPoint) => paymentPoint.uuid === paymentPointUUID),
    });
  };

  return (
    <div className={styles.table}>
      <PaymentTotals renderedRows={renderedRows} selectedPaymentTypeCheckBoxes={selectedPaymentTypeCheckBoxes} />
      <DataTable rows={results ?? []} headers={headers} isSortable>
        {(tableData) => (
          <TableContainer>
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
                  {isOnPaymentPointPage && !isClockedIn && (
                    <Button className={styles.clockIn} onClick={openClockInModal}>
                      Clock In
                    </Button>
                  )}
                  {isOnPaymentPointPage && isClockedIn && (
                    <Button className={styles.clockIn} onClick={openClockOutModal} kind="danger">
                      Clock Out
                    </Button>
                  )}
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
    </div>
  );
};
