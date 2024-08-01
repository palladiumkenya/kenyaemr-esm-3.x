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
} from '@carbon/react';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import styles from './generic-table.scss';

interface GenericTableProps {
  rows: any[];
  headers: { header: string; key: string }[];
}

const GenericTable: React.FC<GenericTableProps> = ({ rows, headers }) => {
  const { t } = useTranslation();
  const pageSize = 10; // Set your desired page size
  const { results: paginatedData, currentPage, goTo } = usePagination(rows, pageSize);
  const isTablet = useLayoutType() === 'tablet';

  return (
    <div>
      <DataTable rows={paginatedData} headers={headers} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
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
      <PatientChartPagination
        currentItems={paginatedData.length}
        totalItems={rows.length}
        onPageNumberChange={goTo}
        pageNumber={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default GenericTable;
