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
import { ErrorState, navigate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLabManifestSamples } from '../hooks';
import styles from './lab-manifest-table.scss';

interface LabManifestSamplesProps {
  manifestUuid: string;
}

const LabManifestSamples: React.FC<LabManifestSamplesProps> = ({ manifestUuid }) => {
  const { error, isLoading, samples } = useLabManifestSamples(manifestUuid);

  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const headerTitle = t('labManifestSamples', 'Lab Manifest Samples');
  const { results, totalPages, currentPage, goTo } = usePagination(samples, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);

  const headers = [
    {
      header: t('patientName', 'Patient name'),
      key: 'startDate',
    },
    {
      header: t('cccKDODNumber', 'CCC/KDOD Number'),
      key: 'cccKDODNumber',
    },
    {
      header: t('batchNumber', 'Batch Number'),
      key: 'batchNumber',
    },
    {
      header: t('sampleType', 'Sample type'),
      key: 'sampleType',
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

  const handleViewManifestSamples = (manifestUuid: string) => {
    navigate({ to: window.getOpenmrsSpaBase() + `home/lab-manifest/${manifestUuid}` });
  };

  const tableRows =
    (results as any[])?.map((sample) => {
      return {
        id: `${sample.uuid}`,
        startDate: sample.startDate ?? '--',
        endDate: sample.endDate,
        courrier: sample.courrier,
        labPersonContact: sample.labPersonContact,
        type: sample.type,
        status: sample.status,
        dispatch: sample.dispatch,
        actions: (
          <Button
            renderIcon={View}
            hasIconOnly
            kind="tertiary"
            iconDescription={t('view', 'View')}
            onClick={() => handleViewManifestSamples(sample.uuid)}
          />
        ),
      };
    }) ?? [];

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (samples.length === 0) {
    return (
      <EmptyState
        headerTitle={t('manifestSamples', 'Manifest Samples')}
        displayText={t('notLabManifetToDisplay', 'There is no lab manifets data to display.')}
      />
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>{''}</CardHeader>
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
        totalItems={samples.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default LabManifestSamples;
