import { DataTable, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@carbon/react';
import { usePagination } from '@openmrs/esm-framework';
import { CardHeader, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import styles from './benebfits-table.scss';

type GenericDataTableProps = {
  headers: Array<{ key: string; header: string }>;
  rows: Array<Record<string, any>>;
  title: string;
};
const GenericDataTable: React.FC<GenericDataTableProps> = ({ headers, rows, title }) => {
  const [pageSize, setPageSize] = useState(10);
  const { results, totalPages, currentPage, goTo } = usePagination(rows, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={title}>{''}</CardHeader>
      <DataTable useZebraStyles size="sm" rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <Pagination
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizes}
        totalItems={rows.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default GenericDataTable;
