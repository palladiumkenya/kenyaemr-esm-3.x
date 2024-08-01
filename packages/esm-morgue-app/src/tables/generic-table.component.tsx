import React from 'react';
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
  Search,
} from '@carbon/react';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import styles from './generic-table.scss';

interface GenericTableProps {
  rows: any[];
  headers: { header: string; key: string }[];
  actionColumn?: (row: any) => React.ReactNode;
  title?: string;
}

const GenericTable: React.FC<GenericTableProps> = ({ rows, headers, actionColumn, title }) => {
  const { t } = useTranslation();
  const pageSize = 10;
  const { results: paginatedData, currentPage, goTo } = usePagination(rows, pageSize);
  const isTablet = useLayoutType() === 'tablet';

  return (
    <>
      <CardHeader title={title} children={''} />
      <div className={styles.searchContainer}>
        <Search
          size="sm"
          placeholder="Search for deceased"
          labelText="Search"
          closeButtonLabelText="Clear search input"
          id="search-deceased"
          onChange={() => {}}
          onKeyDown={() => {}}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.genericTable}>
        <DataTable rows={paginatedData} headers={headers} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer className={styles.tableContainer}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        key={header.key}
                        className={classNames(styles.productiveHeading01, styles.text02)}
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    {actionColumn && <TableHeader>Action</TableHeader>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      {actionColumn && <TableCell>{actionColumn(row)}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        <PatientChartPagination
          currentItems={paginatedData.length}
          totalItems={rows.length}
          onPageNumberChange={goTo}
          pageNumber={currentPage}
          pageSize={pageSize}
        />
      </div>
    </>
  );
};

export default GenericTable;
