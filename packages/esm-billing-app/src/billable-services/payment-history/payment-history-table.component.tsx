import React, { useMemo, useState } from 'react';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
  Search,
  TableContainer,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useDebounce, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { convertToCurrency } from '../../helpers/functions';
import { MappedBill } from '../../types';

export const PaymentHistoryTable = ({
  headers,
  rows = [],
}: {
  headers: Array<Record<string, any>>;
  rows: Array<MappedBill>;
}) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const responsiveSize = useLayoutType() !== 'tablet' ? 'sm' : 'md';
  const [searchString, setSearchString] = useState('');
  const debouncedSearchString = useDebounce(searchString, 1000);

  const searchResults = useMemo(() => {
    if (rows !== undefined && rows.length > 0) {
      if (debouncedSearchString && debouncedSearchString.trim() !== '') {
        const search = debouncedSearchString.toLowerCase();
        return rows?.filter((activeBillRow) =>
          Object.entries(activeBillRow).some(([header, value]) => {
            if (header === 'patientUuid') {
              return false;
            }
            return `${value}`.toLowerCase().includes(search);
          }),
        );
      }
    }

    return rows;
  }, [debouncedSearchString, rows]);

  const { currentPage, goTo, results } = usePagination(searchResults, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, rows.length, currentPage, results.length);

  const transformedRows = results.map((row) => {
    return {
      ...row,
      totalAmount: convertToCurrency(row.payments.reduce((acc, payment) => acc + payment.amountTendered, 0)),
    };
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Search
          size="sm"
          placeholder={t('searchTransactions', 'Search transactions table')}
          labelText={t('searchTransactions', 'Search transactions table')}
          closeButtonLabelText={t('clearSearch', 'Clear search input')}
          id="search-transactions"
          onChange={(event) => setSearchString(event.target.value)}
        />
      </div>
      <DataTable useZebraStyles size="sm" rows={transformedRows} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()} size="sm" aria-label="sample table">
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
          </TableContainer>
        )}
      </DataTable>
      {pageSizes.length > 1 && (
        <Pagination
          forwardText={t('nextPage', 'Next page')}
          backwardText={t('previousPage', 'Previous page')}
          page={currentPage ?? 1}
          pageSize={pageSize ?? 10}
          pageSizes={pageSizes}
          totalItems={searchResults.length ?? 0}
          size={responsiveSize}
          onChange={({ page: newPage, pageSize }) => {
            if (newPage !== currentPage) {
              goTo(newPage);
            }
            setPageSize(pageSize);
          }}
        />
      )}
    </div>
  );
};
