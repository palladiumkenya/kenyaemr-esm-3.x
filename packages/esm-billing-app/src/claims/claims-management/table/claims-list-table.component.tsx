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
import { isDesktop, showModal, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { EmptyState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './claims-list-table.scss';
import { useFacilityClaims } from './use-facility-claims';

const ClaimsManagementTable: React.FC = () => {
  const { claims, isLoading } = useFacilityClaims();
  const [pageSize, setPageSize] = useState(5);
  const { paginated, goTo, results, currentPage } = usePagination(claims, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, claims.length, currentPage, results.length);
  const responsiveSize = isDesktop(useLayoutType()) ? 'sm' : 'lg';
  const { t } = useTranslation();
  const layout = useLayoutType();
  const size = layout === 'tablet' ? 'lg' : 'md';

  const headers = [
    { key: 'claimCode', header: t('claimCode', 'Claim Code') },
    { key: 'status', header: t('status', 'Status') },
    { key: 'providerName', header: t('provider', 'Provider') },
    { key: 'claimedTotal', header: t('claimedAmount', 'Claimed Amount') },
    { key: 'approvedTotal', header: t('approvedTotal', 'Approved Total') },
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
    <DataTable rows={results} headers={headers} isSortable>
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
              totalItems={claims.length}
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
