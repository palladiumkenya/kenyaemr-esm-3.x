import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTableSkeleton,
  Layer,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Tile,
  Pagination,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Button,
} from '@carbon/react';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import {
  EmptyDataIllustration,
  ErrorState,
  usePaginationInfo,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import { useBills } from '../billing.resource';
import InvoiceTable from '../invoice/invoice-table.component';
import styles from './bill-history.scss';
import { MappedBill } from '../types';

interface BillHistoryProps {
  patientUuid: string;
}
const PAGE_SIZE = 10;
const BillHistory: React.FC<BillHistoryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { bills, isLoading, isValidating, error } = useBills(patientUuid);
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { paginated, goTo, results, currentPage } = usePagination(bills, PAGE_SIZE);
  const { pageSizes } = usePaginationInfo(PAGE_SIZE, bills?.length, currentPage, results?.length);

  const headerData = [
    {
      header: t('visitTime', 'Visit time'),
      key: 'visitTime',
    },
    {
      header: t('identifier', 'Identifier'),
      key: 'identifier',
    },
    {
      header: t('billedItems', 'Billed Items'),
      key: 'billedItems',
    },
    {
      header: t('billTotal', 'Bill total'),
      key: 'billTotal',
    },
  ];

  const setBilledItems = (bill: MappedBill) => {
    let items = '';
    if (bill.lineItems.length > 0) {
      bill.lineItems.forEach((i) => {
        items += items && i.item && !i.billableService ? ` & ${i.item}` : i.item ?? '';
        items += items && i.billableService && !i.item ? ` & ${i.billableService}` : i.billableService ?? '';
      });
    }
    return items;
  };

  const rowData = results?.map((bill, index) => ({
    id: `${index}`,
    uuid: bill.uuid,
    billTotal: bill.totalAmount,
    visitTime: bill.dateCreated,
    identifier: bill.identifier,
    billedItems: setBilledItems(bill),
  }));

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton showHeader={false} showToolbar={false} zebra size={responsiveSize} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Layer>
          <ErrorState error={error} headerTitle={t('billsList', 'Bill list')} />
        </Layer>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <Layer className={styles.emptyStateContainer}>
        <Tile className={styles.tile}>
          <div className={styles.illo}>
            <EmptyDataIllustration />
          </div>
          <p className={styles.content}>There are no bills to display.</p>
          <Button onClick={() => launchPatientWorkspace('billing-form')} kind="ghost">
            {t('launchBillForm', 'Launch bill form')}
          </Button>
        </Tile>
      </Layer>
    );
  }

  return (
    <div className={styles.billHistoryContainer}>
      <DataTable isSortable rows={rowData} headers={headerData} size={responsiveSize} useZebraStyles>
        {({
          rows,
          headers,
          getExpandHeaderProps,
          getTableProps,
          getTableContainerProps,
          getHeaderProps,
          getRowProps,
        }) => (
          <TableContainer {...getTableContainerProps}>
            <Table {...getTableProps()} aria-label="bill list">
              <TableHead>
                <TableRow>
                  <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded ? (
                      <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                        <div className={styles.container} key={i}>
                          <InvoiceTable billUuid={rowData?.[i].uuid} />
                        </div>
                      </TableExpandedRow>
                    ) : (
                      <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      {paginated && (
        <Pagination
          forwardText={t('nextPage', 'Next page')}
          backwardText={t('previousPage', 'Previous page')}
          page={currentPage}
          pageSize={PAGE_SIZE}
          pageSizes={pageSizes}
          totalItems={bills.length}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ page: newPage }) => {
            if (newPage !== currentPage) {
              goTo(newPage);
            }
          }}
        />
      )}
    </div>
  );
};

export default BillHistory;
