import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableExpandRow,
  TableExpandedRow,
  Search,
  TableExpandHeader,
} from '@carbon/react';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import styles from './generic-table.scss';
import EmptyDeceasedSearch from '../empty-state/empty-morgue-admission.component';
import { Patient } from '../types';
import NextOfKinDetails from '../component/next-of-kin-details/nextOfKinDetails.component';

interface GenericTableProps {
  rows: any[];
  headers: { header: string; key: string }[];
  actionColumn?: (row: any) => React.ReactNode;
  title?: string;
}

const GenericTable: React.FC<GenericTableProps> = ({ rows, headers, actionColumn, title }) => {
  const { t } = useTranslation();
  const pageSize = 10;
  const isTablet = useLayoutType() === 'tablet';

  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = rows?.filter((row) =>
    headers.some((header) => row[header.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const { results: paginatedData, currentPage, goTo } = usePagination(filteredRows, pageSize);

  return (
    <div className={styles.table}>
      <CardHeader title={title} children={''} />
      <div className={styles.searchContainer}>
        <Search
          size="sm"
          placeholder="Search for deceased"
          labelText="Search"
          closeButtonLabelText="Clear search input"
          id="search-deceased"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {rows?.length === 0 ? (
        <EmptyDeceasedSearch
          title={t('noWaitingList', 'Waiting List')}
          subTitle={t('noDeceasedPersons', 'There are no deceased persons on the waiting list')}
        />
      ) : searchTerm && filteredRows?.length === 0 ? (
        <EmptyDeceasedSearch
          title={t('noResultFound', 'Sorry, no results found')}
          subTitle={t('searchForADeceased', "Try to search again using the deceased patient's unique ID number")}
        />
      ) : (
        <div className={styles.genericTable}>
          <DataTable rows={paginatedData} headers={headers} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
            {({
              rows: tableRows,
              headers,
              getHeaderProps,
              getTableProps,
              getRowProps,
              getTableContainerProps,
              getExpandHeaderProps,
            }) => (
              <TableContainer {...getTableContainerProps()} className={styles.tableContainer}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                      {headers?.map((header, i) => (
                        <TableHeader
                          key={i}
                          {...getHeaderProps({
                            header,
                          })}>
                          {header.header}
                        </TableHeader>
                      ))}
                      {actionColumn && <TableHeader>Action</TableHeader>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableRows?.map((row, i) => {
                      const originalRow = rows.find((r) => r.id === row.id);

                      return (
                        <React.Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                            {actionColumn && <TableCell>{actionColumn(row)}</TableCell>}
                          </TableExpandRow>
                          {row.isExpanded && (
                            <TableExpandedRow colSpan={headers.length + 1}>
                              <div className={styles.expandedRowContent}>
                                {originalRow && <NextOfKinDetails nextOfKin={originalRow.nextOfKin} />}
                              </div>
                            </TableExpandedRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          <PatientChartPagination
            currentItems={paginatedData?.length}
            totalItems={filteredRows?.length}
            onPageNumberChange={({ page }) => goTo(page)}
            pageNumber={currentPage}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default GenericTable;
