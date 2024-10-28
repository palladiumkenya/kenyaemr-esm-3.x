import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './claims-list-table.scss';
import { useFacilityClaims } from './use-facility-claims';

const ClaimsManagementTable: React.FC = () => {
  const { claims, isLoading } = useFacilityClaims();
  const [pageSize, setPageSize] = useState(5);
  const { paginated, goTo, results, currentPage } = usePagination(claims, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, claims.length, currentPage, results.length);
  const { t } = useTranslation();
  const responsiveSize = isDesktop(useLayoutType()) ? 'sm' : 'lg';

  const headers = [
    { key: 'claimCode', header: 'Claim Code' },
    { key: 'status', header: 'Status' },
    { key: 'providerName', header: 'Provider' },
    { key: 'claimedTotal', header: 'Claimed Amount' },
    { key: 'approvedTotal', header: 'Approved Amount' },
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
