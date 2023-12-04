import React, { useMemo, useState, useCallback } from 'react';
import classNames from 'classnames';
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Layer,
  Pagination,
  Search,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableHeader,
  TableCell,
  Tile,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  useLayoutType,
  isDesktop,
  useConfig,
  usePagination,
  ErrorState,
  ConfigurableLink,
} from '@openmrs/esm-framework';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { useBills } from '../billing.resource';
import styles from './bills-table.scss';

const BillsTable = () => {
  const { t } = useTranslation();
  const config = useConfig();
  const layout = useLayoutType();
  const pageSizes = config?.bills?.pageSizes ?? [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(config?.bills?.pageSize ?? 10);
  const { bills, isLoading, isValidating, error } = useBills('');
  const [searchString, setSearchString] = useState('');
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';

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
      header: t('name', 'Name'),
      key: 'patientName',
    },
    {
      header: t('billingService', 'Billing service'),
      key: 'billingService',
    },
  ];

  const searchResults = useMemo(() => {
    if (bills !== undefined && bills.length > 0) {
      if (searchString && searchString.trim() !== '') {
        const search = searchString.toLowerCase();
        return bills?.filter((activeBillRow) =>
          Object.entries(activeBillRow).some(([header, value]) => {
            if (header === 'patientUuid') {
              return false;
            }
            return `${value}`.toLowerCase().includes(search);
          }),
        );
      }
    }

    return bills;
  }, [searchString, bills]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);

  const rowData = results?.map((bill, index) => ({
    id: `${index}`,
    uuid: bill.uuid,
    patientName: (
      <ConfigurableLink
        style={{ textDecoration: 'none', maxWidth: '50%' }}
        to={`${window.getOpenmrsSpaBase()}home/billing/patient/${bill.patientUuid}/${bill.uuid}`}>
        {bill.patientName}
      </ConfigurableLink>
    ),
    visitTime: bill.dateCreated,
    identifier: bill.identifier,
    department: '--',
    billingService: bill.billingService,
    billingPrice: '--',
  }));

  const handleSearch = useCallback(
    (e) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo, setSearchString],
  );

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <FilterableTableHeader
          handleSearch={handleSearch}
          isValidating={isValidating}
          layout={layout}
          responsiveSize={responsiveSize}
          t={t}
        />
        <DataTableSkeleton
          rowCount={pageSize}
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
      <div className={styles.billListContainer}>
        <FilterableTableHeader
          handleSearch={handleSearch}
          isValidating={isValidating}
          layout={layout}
          responsiveSize={responsiveSize}
          t={t}
        />
        <DataTable
          isSortable
          rows={rowData}
          headers={headerData}
          size={responsiveSize}
          useZebraStyles={rowData?.length > 1 ? true : false}>
          {({ rows, headers, getRowProps, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()} aria-label="bill list">
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
        {searchResults?.length === 0 && (
          <div className={styles.filterEmptyState}>
            <Layer level={0}>
              <Tile className={styles.filterEmptyStateTile}>
                <p className={styles.filterEmptyStateContent}>
                  {t('noMatchingBillsToDisplay', 'No matching bills to display')}
                </p>
                <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
              </Tile>
            </Layer>
          </div>
        )}
        {paginated && (
          <Pagination
            forwardText="Next page"
            backwardText="Previous page"
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={searchResults?.length}
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

function FilterableTableHeader({ layout, handleSearch, isValidating, responsiveSize, t }) {
  return (
    <>
      <div className={styles.headerContainer}>
        <div
          className={classNames({
            [styles.tabletHeading]: !isDesktop(layout),
            [styles.desktopHeading]: isDesktop(layout),
          })}>
          <h4>{t('billList', 'Bill list')}</h4>
        </div>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <Search
        labelText=""
        placeholder={t('filterTable', 'Filter table')}
        onChange={handleSearch}
        size={responsiveSize}
      />
    </>
  );
}

export default BillsTable;
