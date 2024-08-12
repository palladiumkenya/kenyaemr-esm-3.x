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
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { UseAllProviders } from '../api/api';
import { defaultPageSize } from '../constants';

export const AdmissionQueue: React.FC = () => {
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(defaultPageSize);
  const { response, isLoading, error, isValidating } = UseAllProviders();

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
  const { pageSizes } = usePaginationInfo(currentPageSize, response.length, currentPage, paginatedResults.length);

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
    { header: t('identifier', 'Identifier'), key: 'id' },
    { header: t('name', 'Name'), key: 'name' },
    { header: t('licenseNumber', 'License Number'), key: 'licenseNumber' },
    { header: t('licenseExpiryDate', 'License expiry date'), key: 'licenseExpiryDate' },
    { header: t('action', 'Action'), key: 'action' },
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
              <Table {...getTableProps()} aria-label={t('providerAdmission', 'Provider Admission')}>
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
                forwardText={t('nextPage', 'Next page')}
                backwardText={t('previousPage', 'Previous page')}
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
