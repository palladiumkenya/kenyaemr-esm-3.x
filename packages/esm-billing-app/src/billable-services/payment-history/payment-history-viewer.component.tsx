import {
  DataTable,
  Pagination,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useBills } from '../../billing.resource';
import { useRenderedRows } from '../../hooks/use-rendered-rows';
import { PaymentStatus, Timesheet } from '../../types';
import { AppliedFilterTags } from './applied-filter-tages.component';
import { Filter } from './filter.component';
import { PaymentHistoryTable } from './payment-history-table.component';
import styles from './payment-history.scss';
import { PaymentTotals } from './payment-totals';
import { TableToolBarDateRangePicker } from './table-toolbar-date-range';
import { TimesheetsFilter } from './timesheets-filter.component';

export const PaymentHistoryViewer = () => {
  const [dateRange, setDateRange] = useState<Array<Date>>([dayjs().startOf('day').toDate(), new Date()]);
  const { paymentPointUUID } = useParams();
  const isOnPaymentPointPage = Boolean(paymentPointUUID);
  const paidBillsResponse = useBills('', isOnPaymentPointPage ? '' : PaymentStatus.PAID, dateRange[0], dateRange[1]);
  const { bills } = paidBillsResponse;

  const [pageSize, setPageSize] = useState(10);
  const [appliedFilters, setAppliedFilters] = useState<Array<string>>([]);
  const [appliedTimesheet, setAppliedTimesheet] = useState<Timesheet>();

  const renderedRows = useRenderedRows(bills, appliedFilters, appliedTimesheet);

  const { paginated, goTo, results, currentPage } = usePagination(renderedRows, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, renderedRows.length, currentPage, results?.length);

  const { t } = useTranslation();
  const headers = [
    { header: t('billDate', 'Date'), key: 'dateCreated' },
    { header: t('patientName', 'Patient Name'), key: 'patientName' },
    { header: t('id', 'Id'), key: 'identifier' },
    { header: t('totalAmount', 'Total Amount'), key: 'totalAmount' },
    { header: t('billingService', 'Service'), key: 'billingService' },
    { header: t('referenceCodes', ' Reference Codes'), key: 'referenceCodes' },
    { header: t('status', 'Status'), key: 'status' },
  ];
  const responsiveSize = isDesktop(useLayoutType()) ? 'sm' : 'lg';

  const handleFilterByDateRange = (dates: Array<Date>) => {
    setDateRange(dates);
  };

  const resetFilters = () => {
    setAppliedFilters([]);
    setAppliedTimesheet(undefined);
  };

  const applyFilters = (filters: string[]) => {
    setAppliedFilters(filters);
    goTo(1);
  };

  const applyTimeSheetFilter = (sheet: Timesheet) => {
    setAppliedTimesheet(sheet);
  };

  return (
    <div className={styles.table}>
      <PaymentTotals renderedRows={renderedRows} appliedFilters={appliedFilters} />
      <DataTable rows={results} headers={headers} isSortable>
        {(tableData) => (
          <TableContainer>
            <div className={styles.tableToolBar}>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => tableData.onInputChange(evt)}
                  />
                  <AppliedFilterTags
                    appliedFilters={[
                      ...appliedFilters,
                      appliedTimesheet && `${appliedTimesheet?.display} (${appliedTimesheet?.cashier.display})`,
                    ]}
                  />
                  <Filter applyFilters={applyFilters} resetFilters={resetFilters} bills={bills} />
                  <TimesheetsFilter
                    appliedFilters={appliedFilters}
                    applyTimeSheetFilter={applyTimeSheetFilter}
                    bills={bills}
                    dateRange={dateRange}
                  />
                  <TableToolBarDateRangePicker onChange={handleFilterByDateRange} currentValues={dateRange} />
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
