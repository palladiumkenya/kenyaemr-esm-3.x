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

type Header<T> = {
  key: keyof T;
  header: string;
  isSortable?: boolean;
};

type GenericTableProps<T> = {
  data: T[];
  headers: Header<T>[];
  pageSize?: number;
  renderRow: (item: T) => React.ReactNode;
};

const GenericTable: React.FC<GenericTableProps<any>> = ({ data, headers, pageSize = 10, renderRow }) => {
  const { t } = useTranslation();
  const { results: paginatedData, currentPage, goTo } = usePagination(data, pageSize);
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
                      key={header.key as string}
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
                  <TableRow key={row.id}>{renderRow(row)}</TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        currentItems={paginatedData.length}
        totalItems={data.length}
        onPageNumberChange={goTo}
        pageNumber={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default GenericTable;
