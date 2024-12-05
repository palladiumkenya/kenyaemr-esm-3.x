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
} from '@carbon/react';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import styles from './operation-log.scss';
import { useLogData } from './operation-log-resource-mock-data';

interface LogData {
  id: string;
  procedure: string;
  startTime: string;
  endTime: string;
  completionStatus: string;
}

const LogTable: React.FC = () => {
  const { t } = useTranslation();
  const pageSize = 10;
  const isTablet = useLayoutType() === 'tablet';

  const logData: Array<LogData> = useLogData().map((item, index) => ({
    ...item,
    id: `row-${index}`,
  }));

  const headers = [
    { header: t('procedure', 'Procedure'), key: 'procedure' },
    { header: t('startTime', 'Start time'), key: 'startTime' },
    { header: t('endTime', 'End time'), key: 'endTime' },
    { header: t('completionStatus', 'Completion status'), key: 'completionStatus' },
  ];

  const { results: paginatedData, currentPage, totalPages, goTo } = usePagination<LogData>(logData, pageSize);

  return (
    <div className={styles.table}>
      <CardHeader title={t('etlOperationLog', 'ETL Operations Log')} children={''} />
      <div className={styles.logTable}>
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
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'completionStatus') {
                          return (
                            <TableCell key={cell.id}>
                              <Tag size="md" type={cell.value === 'Success' ? 'green' : 'red'}>
                                {cell.value}
                              </Tag>
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        <PatientChartPagination
          currentItems={paginatedData.length}
          totalItems={logData.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
};

export default LogTable;
