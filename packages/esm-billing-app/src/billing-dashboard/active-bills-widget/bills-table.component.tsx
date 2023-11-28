import React, { useMemo, useState, useCallback } from 'react';
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
import { useActiveBills } from '../../hooks/useActiveBills';
import styles from './bills-table.scss';
import { EmptyDataIllustration } from './empty-data-illustration.component';

const BillsTable = () => {
  const { t } = useTranslation();
  const config = useConfig();
  const layout = useLayoutType();
  const pageSizes = config?.activeVisits?.pageSizes ?? [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(config?.activeVisits?.pageSize ?? 10);
  const { activeBills, isLoading, isValidating, error } = useActiveBills();
  const [searchString, setSearchString] = useState('');

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
    {
      header: t('billingPrice', 'Billing price'),
      key: 'billingPrice',
    },
    {
      header: t('department', 'Department'),
      key: 'department',
    },
  ];

  const searchResults = useMemo(() => {
    if (activeBills !== undefined && activeBills.length > 0) {
      if (searchString && searchString.trim() !== '') {
        const search = searchString.toLowerCase();
        return activeBills?.filter((activeBillRow) =>
          Object.entries(activeBillRow).some(([header, value]) => {
            if (header === 'patientUuid') {
              return false;
            }
            return `${value}`.toLowerCase().includes(search);
          }),
        );
      }
    }

    return activeBills;
  }, [searchString, activeBills]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);

  const rowData = results?.map((bill, index) => ({
    id: `${index}`,
    uuid: bill.uuid,
    patientName: (
      <ConfigurableLink
        style={{ textDecoration: 'none', maxWidth: '50%' }}
        to={`\${openmrsSpaBase}/patient/${bill.patientUuid}/chart`}>
        {bill.patientName}
      </ConfigurableLink>
    ),
    visitTime: '--',
    identifier: bill.identifier,
    department: '--',
    billingService: '--',
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
      <div className={styles.activeVisitsContainer}>
        <div className={styles.activeVisitsDetailHeaderContainer}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('billsList', 'Bills list')}</h4>
          </div>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
        </div>
        <Search
          labelText=""
          placeholder={t('filterTable', 'Filter table')}
          onChange={handleSearch}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          disabled
        />
        <DataTableSkeleton
          rowCount={pageSize}
          showHeader={false}
          showToolbar={false}
          zebra
          columnCount={headerData?.length}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.activeVisitsContainer}>
        <Layer>
          <ErrorState error={error} headerTitle={t('billsList', 'Bills list')} />
        </Layer>
      </div>
    );
  }

  if (!activeBills.length && isLoading === false) {
    return (
      <div className={styles.activeVisitsContainer}>
        <Layer>
          <Tile className={styles.tile}>
            <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
              <h4>{t('billsList', 'Bills list')}</h4>
            </div>
            <EmptyDataIllustration />
            <p className={styles.content}>
              {t('noBillsForLocation', 'There are no bills to display for this location.')}
            </p>
          </Tile>
        </Layer>
      </div>
    );
  } else {
    return (
      <div className={styles.activeVisitsContainer}>
        <div className={styles.activeVisitsDetailHeaderContainer}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('billList', 'Bills list')}</h4>
          </div>
          <div className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </div>
        </div>
        <Search
          labelText=""
          placeholder={t('filterTable', 'Filter table')}
          onChange={handleSearch}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
        <DataTable
          isSortable
          rows={rowData}
          headers={headerData}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          useZebraStyles={rowData?.length > 1 ? true : false}>
          {({ rows, headers, getRowProps, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()} aria-label="sample table">
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
                <p className={styles.filterEmptyStateContent}>{t('noBillsToDisplay', 'No bills to display')}</p>
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
            size={isDesktop(layout) ? 'sm' : 'lg'}
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
};

export default BillsTable;
