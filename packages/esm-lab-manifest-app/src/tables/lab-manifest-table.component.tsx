import {
  Button,
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
} from '@carbon/react';
import { View } from '@carbon/react/icons';
import { ErrorState, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLabManifest } from '../hooks';
import styles from './lab-manifest-table.scss';

const LabManifestsTable = () => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const headerTitle = t('lab Manifest', 'Lab Manifest');
  const layout = useLayoutType();
  const { manifests, error, isLoading } = useLabManifest('');
  const { results, totalPages, currentPage, goTo } = usePagination(manifests, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);

  const headers = [
    {
      header: t('startDate', 'Start date'),
      key: 'startDate',
    },
    {
      header: t('endDate', 'End Date'),
      key: 'endDate',
    },
    {
      header: t('type', 'Type'),
      key: 'type',
    },
    {
      header: t('courrier', 'Courrier'),
      key: 'courrier',
    },
    {
      header: t('manifestId', 'Manifest Id'),
      key: 'manifestId',
    },
    {
      header: t('labPersonContact', 'Lab person Contact'),
      key: 'labPersonContact',
    },
    {
      header: t('status', 'Status'),
      key: 'status',
    },
    {
      header: t('dispatch', 'Dispatch'),
      key: 'dispatch',
    },
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const handleAddContact = () => {
    // launchWorkspace('contact-list-form', {
    //   workspaceTitle: 'Contact Form',
    // });
  };

  const tableRows =
    results?.map((manifest) => {
      const patientUuid = manifest.uuid;

      return {
        id: `${manifest.uuid}`,
        startDate: manifest.startDate ?? '--',
        endDate: manifest.endDate,
        courrier: manifest.courrier,
        labPersonContact: manifest.labPersonContact,
        type: manifest.type,
        status: manifest.status,
        dispatch: manifest.dispatch,
        actions: <Button renderIcon={View} hasIconOnly kind="tertiary" />,
      };
    }) ?? [];

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (manifests.length === 0) {
    return <EmptyState displayText={t('labManifest', 'Lab Manifest')} headerTitle="Lab manifest title" />;
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        {/* <Dropdown
          id="manifestStatus"
          onChange={({ selectedItem }) => {}}
          titleText={t('paymentMethod', 'Payment method')}
          label={t('selectPaymentMethod', 'Select payment method')}
          items={LabManifestFilters.map((mn) => mn.value)}
          itemToString={(item) => LabManifestFilters.find((lm) => lm.value === item)?.label ?? ''}
        /> */}
        {''}
      </CardHeader>
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows ?? []}
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
                      {header.header?.content ?? header.header}
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
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizes}
        totalItems={manifests.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default LabManifestsTable;
