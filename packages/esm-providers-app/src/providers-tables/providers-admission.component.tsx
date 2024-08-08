import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTable,
  DataTableSkeleton,
  Pagination,
  TableContainer,
  TableToolbar,
  TableToolbarSearch,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { usePagination } from '@openmrs/esm-framework';
import { getAllProviders } from '../api/api';
import { use } from 'i18next';

export const Admissionqueue: React.FC = () => {
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(5);
  const { response, isLoading, error, isValidating } = getAllProviders();

  useEffect(() => {}, [response, isLoading, error, isValidating]);

  const filteredResult = response.map((provider) => {
    // Extract custom attributes
    const licenseNumberAttr = provider.attributes.find((attr) => attr.display.startsWith('Licence Number'));
    const licenseExpiryDateAttr = provider.attributes.find((attr) => attr.display.startsWith('Licence Expiry Date'));

    return {
      id: provider.uuid,
      identifier: provider.identifier,
      name: provider.person.display,
      licenseNumber: licenseNumberAttr ? licenseNumberAttr.display.split(': ')[1] : null,
      licenseExpiryDate: licenseExpiryDateAttr ? licenseExpiryDateAttr.display.split(': ')[1] : null,
    };
  });

  const { goTo, results: paginatedResults, currentPage } = usePagination(filteredResult, currentPageSize);

  // const pageSizes = [5, 10, 15, 20, 25];
  const pageSizes = [10, 20, 30, 40, 50];

  const rows = useMemo(() => {
    return paginatedResults.map((entry: any) => ({
      ...entry,
      action: (
        <OverflowMenu flipped={document?.dir === 'rtl'} aria-label="overflow-menu">
          <OverflowMenuItem itemText="Sync with HWR" />
          <OverflowMenuItem itemText="Edit details" />
          <OverflowMenuItem hasDivider isDelete itemText="Delete details" />
        </OverflowMenu>
      ),
    }));
  }, [paginatedResults]);

  const tableColumns = [
    { id: 0, header: t('id', 'IDENTIFIER'), key: 'id' },
    { id: 1, header: t('name', 'NAME'), key: 'name' },
    { id: 2, header: t('licenseNumber', 'LICENSE NUMBER'), key: 'licenseNumber' },
    { id: 3, header: t('licenseExpiryDate', 'LICENSE EXPIRY DATE'), key: 'licenseExpiryDate' },
    { id: 4, header: t('action', 'ACTION'), key: 'action' },
  ];

  return isLoading ? (
    <DataTableSkeleton />
  ) : (
    <div>
      <DataTable rows={rows} headers={tableColumns} useZebraStyles overflowMenuOnHover={true} isSortable>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getTableContainerProps }) => (
          <>
            <TableContainer {...getTableContainerProps()}>
              <TableToolbar
                style={{
                  position: 'static',
                  height: '3rem',
                  overflow: 'visible',
                  margin: 0,
                  backgroundColor: 'transparent',
                }}>
                <TableToolbarSearch />
              </TableToolbar>
              <Table {...getTableProps()} aria-label="sample table">
                <TableHead>
                  <TableRow>
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
                  {rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex} {...getRowProps({ row })}>
                      {row.cells.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={response.length}
                onChange={({ pageSize, page }) => {
                  if (pageSize !== currentPageSize) {
                    setCurrentPageSize(pageSize);
                    goTo(1);
                  }
                  if (page !== currentPage) {
                    goTo(page);
                  }
                }}
              />
            </TableContainer>
          </>
        )}
      </DataTable>
    </div>
  );
};
