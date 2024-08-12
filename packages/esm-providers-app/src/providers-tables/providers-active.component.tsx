import React, { useMemo, useState } from 'react';
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

export const ActiveProviders: React.FC = () => {
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);

  // Dummy data for AdmissionWorkListEntries
  const AdmissionWorkListEntries = [
    // {
    //   id: 1,
    //   name: 'John Doe',
    //   date: '2024-03-20',
    //   cause: 'Heart Attack',
    //   created: 'Admin',
    //   'date-created': '2024-03-19',
    // },
    // {
    //   id: 2,
    //   name: 'Jane Smith',
    //   date: '2024-03-21',
    //   cause: 'Stroke',
    //   created: 'Doctor',
    //   'date-created': '2024-03-20',
    // },
    // {
    //   id: 3,
    //   name: 'Alice Johnson',
    //   date: '2024-03-22',
    //   cause: 'Accident',
    //   created: 'Nurse',
    //   'date-created': '2024-03-21',
    // },
    // {
    //   id: 4,
    //   name: 'Bob Brown',
    //   date: '2024-03-23',
    //   cause: 'Infection',
    //   created: 'Admin',
    //   'date-created': '2024-03-22',
    // },
    // {
    //   id: 5,
    //   name: 'Eva Garcia',
    //   date: '2024-03-24',
    //   cause: 'Allergic Reaction',
    //   created: 'Doctor',
    //   'date-created': '2024-03-23',
    // },
    // {
    //   id: 6,
    //   name: 'Michael Lee',
    //   date: '2024-03-25',
    //   cause: 'Food Poisoning',
    //   created: 'Nurse',
    //   'date-created': '2024-03-24',
    // },
    // {
    //   id: 7,
    //   name: 'Sophia Martinez',
    //   date: '2024-03-26',
    //   cause: 'Burn',
    //   created: 'Admin',
    //   'date-created': '2024-03-25',
    // },
    // {
    //   id: 8,
    //   name: 'William Wilson',
    //   date: '2024-03-27',
    //   cause: 'Fracture',
    //   created: 'Doctor',
    //   'date-created': '2024-03-26',
    // },
    // {
    //   id: 9,
    //   name: 'Olivia Taylor',
    //   date: '2024-03-28',
    //   cause: 'Pneumonia',
    //   created: 'Nurse',
    //   'date-created': '2024-03-27',
    // },
    // {
    //   id: 10,
    //   name: 'Daniel Anderson',
    //   date: '2024-03-29',
    //   cause: 'Appendicitis',
    //   created: 'Admin',
    //   'date-created': '2024-03-28',
    // },
    // Add more entries as needed
  ];

  const isLoading = false;

  const searchResults = AdmissionWorkListEntries.filter(() => {
    return true; // No filtering applied for now
  });

  const { goTo, results: paginatedResults, currentPage } = usePagination(searchResults, currentPageSize);

  const pageSizes = [10, 20, 30, 40, 50];

  const rows = useMemo(() => {
    return paginatedResults.map((entry) => ({
      ...entry,
      action: (
        <OverflowMenu flipped={document?.dir === 'rtl'} aria-label="overflow-menu">
          <OverflowMenuItem itemText="Sync CR" />
          <OverflowMenuItem itemText="Edit details" />
          <OverflowMenuItem hasDivider isDelete itemText="Delete details" />
        </OverflowMenu>
      ),
    }));
  }, [paginatedResults]);

  const tableColumns = [
    { header: t('id', 'Identifier'), key: 'id' },
    { header: t('name', 'Name'), key: 'name' },
    { header: t('name', 'License Number'), key: 'license' },
    { header: t('date', 'License expiry date'), key: 'date' },
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
                totalItems={AdmissionWorkListEntries.length}
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
