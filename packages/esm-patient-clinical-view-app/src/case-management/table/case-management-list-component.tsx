import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Button,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { EmptyDataIllustration, ErrorState, CardHeader, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { isDesktop, launchWorkspace, navigate, useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import styles from './case-management-list.scss';

interface CaseManagementProps {
  encounterTypeUuid: string;
  formEntrySub: any;
  patientUuid: string;
}

const CaseManagementList: React.FC<CaseManagementProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const layout = useLayoutType();
  const [pageSize, setPageSize] = useState(10);
  const headerTitle = t('CaseManagement', 'Case Management');

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
      header: t('action', 'Action'),
      key: 'action',
    },
  ];

  const tableRows = [];
  const handleAddContact = () => {
    launchWorkspace('contact-list-form', {
      workspaceTitle: 'Contact Form',
    });
  };

  const handleAddHistory = () => {
    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/edit` });
  };

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        <Button onClick={handleAddContact} renderIcon={Add} kind="ghost">
          {t('add', 'Add')}
        </Button>
      </CardHeader>
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
        onChange={({ page, pageSize }) => {
          // Handle pagination change
        }}
      />
    </div>
  );
};

export default CaseManagementList;
