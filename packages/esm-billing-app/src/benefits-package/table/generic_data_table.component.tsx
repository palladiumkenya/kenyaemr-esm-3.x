import {
  Button,
  DataTable,
  Layer,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { ReactNode, useState } from 'react';
import styles from './generic-data-table.scss';
import { useTranslation } from 'react-i18next';

type GenericDataTableProps = {
  headers: Array<{ key: string; header: string }>;
  rows: Array<Record<string, any>>;
  title: string;
  renderActionComponent?: () => ReactNode;
};
const GenericDataTable: React.FC<GenericDataTableProps> = ({ headers, rows, title, renderActionComponent }) => {
  const [pageSize, setPageSize] = useState(10);
  const { results, totalPages, currentPage, goTo } = usePagination(rows, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={title}>{renderActionComponent?.()}</CardHeader>
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

type GenericTableEmptyStateProps = {
  headerTitle: string;
  displayText: string;
  renderAction?: () => any;
};

export const GenericTableEmptyState: React.FC<GenericTableEmptyStateProps> = ({
  displayText,
  headerTitle,
  renderAction,
}) => {
  const layout = useLayoutType();
  return (
    <Layer className={styles.border}>
      <Tile className={styles.tile}>
        <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{headerTitle}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>{displayText}</p>
        {renderAction?.()}
      </Tile>
    </Layer>
  );
};
