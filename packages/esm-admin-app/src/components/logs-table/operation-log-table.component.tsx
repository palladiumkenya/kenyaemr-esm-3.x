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
  Tag,
  DataTableSkeleton,
  InlineLoading,
} from '@carbon/react';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, usePagination, formatDate } from '@openmrs/esm-framework';
import styles from './operation-log.scss';
import { ETLResponse } from '../../types';
import EmptyState from '../empty-state/empty-state-log.components';

interface LogTableProps {
  logData: ETLResponse[];
  isLoading: boolean;
}

const LogTable: React.FC<LogTableProps> = ({ logData, isLoading }) => {
  const { t } = useTranslation();
  const pageSize = 10;
  const isTablet = useLayoutType() === 'tablet';

  const headers = [
    { header: t('procedure', 'Procedure'), key: 'script_name' },
    { header: t('startTime', 'Start time'), key: 'start_time' },
    { header: t('endTime', 'End time'), key: 'stop_time' },
    { header: t('completionStatus', 'Completion status'), key: 'status' },
  ];

  const rows = logData?.map((item, index) => ({
    id: index.toString(),
    script_name: item.script_name,
    start_time: item?.start_time ? formatDate(new Date(item?.start_time)) : '--',
    stop_time: item?.stop_time ? formatDate(new Date(item?.stop_time)) : '--',
    status: item.status,
  }));

  const { results: paginatedData, currentPage, goTo } = usePagination(rows, pageSize);

  return (
    <div className={styles.table}>
      <CardHeader title={t('facilityInfo', 'Facility Info')} children={''} />
      <div className={styles.logTable}>
        {isLoading && logData.length === 0 ? (
          <DataTableSkeleton
            headers={headers}
            aria-label="etl table"
            showToolbar={false}
            showHeader={false}
            rowCount={4}
            zebra
            columnCount={3}
            className={styles.dataTableSkeleton}
          />
        ) : logData.length === 0 ? (
          <EmptyState subTitle={t('noRecordsFound', 'No ETL Operation logs found')} />
        ) : (
          <>
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
                            {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === 'status' ? (
                                <Tag size="md" type={cell.value === 'Success' ? 'green' : 'red'}>
                                  {cell.value}
                                </Tag>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
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
              onPageNumberChange={({ page }) => goTo(page)}
              pageNumber={currentPage}
              pageSize={pageSize}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LogTable;
