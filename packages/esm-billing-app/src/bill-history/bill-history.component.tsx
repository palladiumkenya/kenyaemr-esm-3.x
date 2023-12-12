import { ErrorState, isDesktop, useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBills } from '../billing.resource';
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
} from '@carbon/react';
import styles from './bill-history.scss';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import InvoiceTable from '../invoice/invoice-table.component';

interface BillHistoryProps {
  patientUuid: string;
}

const BillHistory: React.FC<BillHistoryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const { bills, isLoading, isValidating, error } = useBills(patientUuid);
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const pageSizes = config?.bills?.pageSizes ?? [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(config?.bills?.pageSize ?? 10);
  const { paginated, goTo, results, currentPage } = usePagination(bills, pageSize);

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
      header: t('billingService', 'Billing service'),
      key: 'billingService',
    },
    {
      header: t('billTotal', 'Bill total'),
      key: 'billTotal',
    },
  ];

  const rowData = results?.map((bill, index) => ({
    id: `${index}`,
    uuid: bill.uuid,
    billTotal: bill.totalAmount,
    visitTime: bill.dateCreated,
    identifier: bill.identifier,
    billingService: bill.billingService,
  }));

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

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Layer>
          <ErrorState error={error} headerTitle={t('billsList', 'Bill list')} />
        </Layer>
      </div>
    );
  }

  if (bills?.length > 0) {
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
            forwardText="Next page"
            backwardText="Previous page"
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={bills?.length}
            className={styles.pagination}
            size={responsiveSize}
            onChange={({ pageSize: newPageSize, page: newPage }) => {
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
              }
              if (newPage !== currentPage) {
                goTo(newPage);
              }
            }}
          />
        )}
      </div>
    );
  }

  return (
    <Layer className={styles.emptyStateContainer}>
      <Tile className={styles.tile}>
        <div className={styles.illo}>
          <EmptyDataIllustration />
        </div>
        <p className={styles.content}>There are no bills to display.</p>
      </Tile>
    </Layer>
  );
};

export default BillHistory;
