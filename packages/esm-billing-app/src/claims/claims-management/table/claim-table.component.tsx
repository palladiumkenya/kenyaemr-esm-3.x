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
import { Claim, ClaimsPreAuthFilter, DataTableRow, Header, TableProps } from '../../../types';
import ClaimsFilterHeader from '../header/filter-header.component';
import styles from './claims-list-table.scss';
import { useFacilityClaims } from './use-facility-claims';
import { statusColors } from '../../utils';

const ClaimStatus = ({ row }: { row: DataTableRow }) => {
  const { claims } = useFacilityClaims();
  const { t } = useTranslation();

  const claim = claims.find((claim) => claim.id === row.id) as Claim;

  // Default to 'gray' if status not found in the mapping
  const tagType = statusColors[claim.status] || 'gray';

  return (
    <div className={styles.claimStatus}>
      <Tag type={tagType}>{claim.status}</Tag>
    </div>
  );
};

const ClaimsTable: React.FC<TableProps> = ({ title, emptyStateText, emptyStateHeader, includeClaimCode = false }) => {
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
      { value: 'APPROVED', label: t('approved', 'Approved') },
    ],
    [t],
  );

  const [pageSize, setPageSize] = useState(5);

  const filterClaims = (claim: Claim) => {
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

  const getHeaders = (): Header[] => {
    let baseHeaders = [
      { key: 'status', header: t('status', 'Status') },
      { key: 'providerName', header: t('provider', 'Provider') },
      { key: 'patientName', header: t('patient', 'Patient') },
      { key: 'claimedTotal', header: t('claimedAmount', 'Claimed Amount') },
      { key: 'approvedTotal', header: t('approvedTotal', 'Approved Total') },
      { key: 'dateFrom', header: t('dateCreated', 'Date Created') },
      { key: 'action', header: t('action', 'Action') },
    ];

    if (includeClaimCode) {
      return [{ key: 'claimCode', header: t('claimCode', 'Claim Code') }, ...baseHeaders];
    }

    return baseHeaders;
  };

  const headers = getHeaders();

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
        <EmptyState displayText={t(emptyStateText)} headerTitle={t(emptyStateHeader)} />
      </div>
    );
  }

  const handleClaimAction = (claimId: string, modalType: 'retry' | 'update') => {
    const dispose = showModal('manage-claim-request-modal', {
      closeModal: () => dispose(),
      claimId,
      modalType,
    });
  };

  // Cell rendering functions
  const renderStatusCell = (row: DataTableRow) => {
    return <ClaimStatus row={row} />;
  };

  const renderActionCell = (row: DataTableRow, rowStatus: string, size: string) => {
    return (
      <OverflowMenu size={size} flipped>
        {['ENTERED', 'ERRORED'].includes(rowStatus) && (
          <OverflowMenuItem
            itemText={t('retryRequest', 'Retry request')}
            onClick={() => handleClaimAction(row.id, 'retry')}
          />
        )}
        <OverflowMenuItem
          itemText={t('updateStatus', 'Update status')}
          onClick={() => handleClaimAction(row.id, 'update')}
        />
      </OverflowMenu>
    );
  };

  const renderDateFromCell = (cellValue: string) => {
    return formatDate(parseDate(cellValue));
  };

  const renderApprovedTotalCell = (row: DataTableRow, rowStatus: string, cellValue: any) => {
    if (['APPROVED'].includes(rowStatus)) {
      const claimedTotal = row.cells.find((c) => c.info.header === 'claimedTotal')?.value;
      return claimedTotal || cellValue;
    }
    return cellValue;
  };

  const renderCellContent = (cell: any, row: DataTableRow, rowStatus: string) => {
    const header = cell.info.header;

    if (header === 'status') {
      return renderStatusCell(row);
    }

    if (header === 'action') {
      return renderActionCell(row, rowStatus, size);
    }

    if (header === 'dateFrom') {
      return renderDateFromCell(cell.value);
    }

    if (header === 'approvedTotal') {
      return renderApprovedTotalCell(row, rowStatus, cell.value);
    }

    return cell.value;
  };

  return (
    <div className={styles.dataTableSkeleton}>
      <div className={styles.tableHeader}>
        <CardHeader title={t(title)}>{''}</CardHeader>
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
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{renderCellContent(cell, row, rowStatus)}</TableCell>
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

export default ClaimsTable;
