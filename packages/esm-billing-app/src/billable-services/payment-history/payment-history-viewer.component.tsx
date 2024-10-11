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
import { useServiceTypes } from '../billable-service.resource';
import { AppliedFilterTags } from './applied-filter-tages.component';
import { CashierFilter } from './cashier-filter.component';
import { PaymentHistoryTable } from './payment-history-table.component';
import styles from './payment-history.scss';
import { PaymentTotals } from './payment-totals';
import { PaymentTypeFilter } from './payment-type-filter.component';
import { ServiceTypeFilter } from './service-type-filter.component';
import { TableToolBarDateRangePicker } from './table-toolbar-date-range';

export const headers = [
  { header: 'Date', key: 'dateCreated' },
  { header: 'Patient Name', key: 'patientName' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Service', key: 'billingService' },
  { header: 'Reference Codes', key: 'referenceCodes' },
];

export const PaymentHistoryViewer = () => {
  const [renderedRows, setRenderedRows] = useState<null | MappedBill[]>(null);
  const [dateRange, setDateRange] = useState<Date[]>([dayjs().startOf('day').toDate(), new Date()]);
  const { paymentPointUUID } = useParams();
  const { paymentPoints } = usePaymentPoints();
  const { isClockedInCurrentPaymentPoint } = useClockInStatus(paymentPointUUID);
  const { serviceTypes } = useServiceTypes();

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
  const [selectedServiceTypeCheckboxes, setSelectedServiceTypeCheckboxes] = useState<string[]>([]);

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

  useEffect(() => {
    if (bills.length === 0) {
      return;
    }
    const filteredBills = bills
      .filter((row) => {
        if (selectedCashierCheckboxes.length === 0) {
          return true;
        }
        const rowValues: string[] = getAllValues(row);
        return selectedCashierCheckboxes.some((cashier) =>
          rowValues.some((value) => String(value).toLowerCase().includes(cashier.toLowerCase())),
        );
      })
      .filter((row) => {
        if (selectedPaymentTypeCheckBoxes.length === 0) {
          return true;
        }
        const rowValues: string[] = getAllValues(row);
        return selectedPaymentTypeCheckBoxes.some((paymentType) =>
          rowValues.some((value) => String(value).toLowerCase().includes(paymentType.toLowerCase())),
        );
      })
      .filter((row) => {
        if (selectedServiceTypeCheckboxes.length === 0) {
          return true;
        }
        const rowValues: string[] = getAllValues(row);
        return selectedServiceTypeCheckboxes.some((serviceType) =>
          rowValues.some((value) => String(value).toLowerCase().includes(serviceType.toLowerCase())),
        );
      });

    setRenderedRows(filteredBills);
    goTo(1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCashierCheckboxes, selectedPaymentTypeCheckBoxes, selectedServiceTypeCheckboxes]);

  const onApplyCashierFilter = (appliedCashierCheckboxes: Array<string>) => {
    setSelectedCashierCheckboxes(appliedCashierCheckboxes);
  };

  const onApplyPaymentTypeFilter = (appliedPaymentTypeCheckboxes: Array<string>) => {
    setSelectedPaymentTypeCheckBoxes(appliedPaymentTypeCheckboxes);
  };

  const onApplyServiceTypeFilter = (appliedServiceTypes: Array<string>) => {
    setSelectedServiceTypeCheckboxes(appliedServiceTypes);
  };

  const handleOnResetCashierFilter = () => {
    setSelectedCashierCheckboxes([]);
  };

  const handleOnResetPaymentTypeFilter = () => {
    setSelectedPaymentTypeCheckBoxes([]);
  };

  const handleOnResetServiceTypeFilter = () => {
    setSelectedServiceTypeCheckboxes([]);
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

  const serviceTypeTags = selectedServiceTypeCheckboxes.map((t) => {
    return {
      tag: serviceTypes.find((sT) => sT.uuid === t)?.display,
      type: 'Service Type',
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
                  <AppliedFilterTags tags={[...cashierTags, ...paymentTypeTags, ...serviceTypeTags]} />
                  <ServiceTypeFilter
                    onApplyFilter={onApplyServiceTypeFilter}
                    onResetFilter={handleOnResetServiceTypeFilter}
                    bills={bills}
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
                  {isOnPaymentPointPage && !isClockedInCurrentPaymentPoint && (
                    <Button className={styles.clockIn} onClick={openClockInModal}>
                      Clock In
                    </Button>
                  )}
                  {isOnPaymentPointPage && isClockedInCurrentPaymentPoint && (
                    <Button className={styles.clockIn} onClick={openClockOutModal} kind="danger">
                      Clock Out
                    </Button>
                  )}
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <PaymentHistoryTable
              tableData={tableData}
              paidBillsResponse={paidBillsResponse}
              renderedRows={renderedRows}
            />
            {paginated && !paidBillsResponse.isLoading && !paidBillsResponse.error && (
              <Pagination
                forwardText={t('nextPage', 'Next page')}
                backwardText={t('previousPage', 'Previous page')}
                page={currentPage}
                pageSize={pageSize}
                pageSizes={pageSizes}
                totalItems={renderedRows.length}
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
