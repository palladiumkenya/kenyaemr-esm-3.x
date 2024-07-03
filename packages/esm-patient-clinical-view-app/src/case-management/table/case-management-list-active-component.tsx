import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Search,
} from '@carbon/react';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import styles from './case-management-list.scss';

const CaseManagementListActive: React.FC = () => {
  const { t } = useTranslation();
  const config = useConfig();
  const layout = useLayoutType();
  const [pageSize, setPageSize] = useState(10);
  const responsiveSize = isDesktop(layout) ? 'lg' : 'sm';

  const headerTitle = t('activeCases', 'Active Cases');

  const headers = [
    {
      header: t('date', 'Date'),
      key: 'date',
    },
    {
      header: t('names', 'Names'),
      key: 'names',
    },
    {
      header: t('reason', 'Reason for asigned'),
      key: 'age',
    },
    {
      header: t('dateofstart', 'Start Date'),
      key: 'dateofstart',
    },
    {
      header: t('dateofend', 'End Date'),
      key: 'dateofend',
    },
    {
      header: t('notes', 'Notes'),
      key: 'notes',
    },
    {
      header: t('action', 'Action'),
      key: 'action',
    },
  ];

  const tableRows = [];

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle} children={''}></CardHeader>
      <Search labelText="" placeholder={t('filterTable', 'Filter table')} size={responsiveSize} />
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows}
        headers={headers}
        render={({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
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
      />
      <Pagination
        page={1}
        pageSize={pageSize}
        pageSizes={[5, 10, 15]}
        totalItems={tableRows.length}
        onChange={({ page, pageSize }) => {}}
      />
    </div>
  );
};

export default CaseManagementListActive;
