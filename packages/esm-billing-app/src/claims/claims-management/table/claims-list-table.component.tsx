import {
  DataTable,
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@carbon/react';
import { formatDate, isDesktop, parseDate, showModal, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClaimsPreAuthFilter } from '../../../types';
import ClaimsFilterHeader from '../header/filter-header.component';
import styles from './claims-list-table.scss';
import { useFacilityClaims } from './use-facility-claims';

const ClaimsManagementTable: React.FC = () => {
  const { claims, isLoading } = useFacilityClaims();
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ClaimsPreAuthFilter>({
    status: 'all',
  });
  const status = useMemo(
    () => [
      { value: 'all', label: t('all', 'All') },
      { value: 'ENTERED', label: t('entered', 'Entered') },
      { value: 'ERRORED', label: t('errored', 'Errored') },
      { value: 'REJECTED', label: t('rejected', 'Rejected') },
      { value: 'CHECKED', label: t('checked', 'Checked') },
      { value: 'VALUATED', label: t('valuated', 'Valuated') },
    ],
    [t],
  );
  const [pageSize, setPageSize] = useState(5);
  const filterClaims = (claim) => {
    const status = filters?.status;
    const search = filters?.search?.toLowerCase();
    const fromDate = filters?.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters?.toDate ? new Date(filters.toDate) : null;

    const patientName = claim.patientName?.toLowerCase();
    const providerName = claim.providerName?.toLowerCase();
    const timeStamp = new Date(claim.dateFrom);
    const preauthStatus = claim.status;

    // Check status (allow 'all' to bypass the filter)
    const statusMatch = status === 'all' || preauthStatus === status;

    // Check search filter (patient name or provider name contains the search term)
    const searchMatch = !search || patientName?.includes(search) || providerName?.includes(search);

    // Check date range filter (timestamp is between fromDate and toDate if provided)
    const dateMatch = (!fromDate || timeStamp >= fromDate) && (!toDate || timeStamp <= toDate);

    // Return true if all conditions match
    return statusMatch && searchMatch && dateMatch;
  };

  const filteredClaims = claims.filter(filterClaims);
  const { paginated, goTo, results, currentPage } = usePagination(filteredClaims, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, claims.length, currentPage, results.length);
  const responsiveSize = isDesktop(useLayoutType()) ? 'sm' : 'lg';
  const layout = useLayoutType();
  const size = layout === 'tablet' ? 'lg' : 'md';

  const headers = [
    { key: 'claimCode', header: t('claimCode', 'Claim Code') },
    { key: 'status', header: t('status', 'Status') },
    { key: 'providerName', header: t('provider', 'Provider') },
    { key: 'patientName', header: t('patient', 'Patient') },
    { key: 'claimedTotal', header: t('claimedAmount', 'Claimed Amount') },
    { key: 'approvedTotal', header: t('approvedTotal', 'Approved Total') },
    { key: 'dateFrom', header: t('dateCreated', 'Date Created') },
    { key: 'action', header: t('action', 'Action') },
  ];

  if (isLoading) {
    return (
      <div className={styles.dataTableSkeleton}>
        <DataTableSkeleton
          headers={headers}
          showToolbar={false}
          showHeader={false}
          columnCount={Object.keys(headers).length}
          zebra
          rowCount={pageSize}
        />
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className={styles.claimsTable}>
        <EmptyState
          displayText={t('emptyClaimsState', 'There are no claims to display')}
          headerTitle={t('emptyClaimsHeader', 'No Claims')}
        />
      </div>
    );
  }

  const handleRetry = (claimId: string) => {
    const dispose = showModal('retry-claim-request-modal', {
      closeModal: () => dispose(),
      claimId,
    });
  };

  return (
    <div className={styles.dataTableSkeleton}>
      <div className={styles.tableHeader}>
        <CardHeader title={t('claims', 'Claims')}>{''}</CardHeader>
        <ClaimsFilterHeader filters={filters} onFilterChanged={setFilters} statusOptions={status} />
      </div>
      <DataTable rows={results} headers={headers} isSortable useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <TableContainer className={styles.claimsTable}>
            <Table {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      key={header.key}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const rowStatus = row.cells.find((cell) => cell.info.header === 'status')?.value;
                  return (
                    <TableRow
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.info.header === 'status' ? (
                            <ClaimStatus cell={cell} row={row} />
                          ) : cell.info.header === 'action' && ['ENTERED', 'ERRORED'].includes(rowStatus) ? (
                            <OverflowMenu size={size} flipped>
                              <OverflowMenuItem
                                itemText={t('retryRequest', 'Retry request')}
                                onClick={() => handleRetry(row.id)}
                              />
                            </OverflowMenu>
                          ) : cell.info.header === 'dateFrom' ? (
                            formatDate(parseDate(cell.value))
                          ) : (
                            cell.value
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {paginated && !isLoading && (
              <Pagination
                forwardText=""
                backwardText=""
                page={currentPage}
                pageSize={pageSize}
                pageSizes={pageSizes}
                totalItems={filteredClaims.length}
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

export default ClaimsManagementTable;

const ClaimStatus = ({ cell, row }: { cell: { value: string }; row: any }) => {
  const { claims } = useFacilityClaims();

  const claim = claims.find((claim) => claim.id === row.id);
  return (
    <div className={styles.claimStatus}>
      <p>{cell.value}</p>
      {claim.externalId && <Tag type="blue">{claim.externalId}</Tag>}
    </div>
  );
};
