import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
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
} from '@carbon/react';
import { View } from '@carbon/react/icons';
import {
  ErrorState,
  formatDate,
  isDesktop,
  navigate,
  parseDate,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLabManifests } from '../hooks';
import { LabManifestFilters } from '../lab-manifest.resources';
import styles from './lab-manifest-table.scss';

const LabManifestsTable = () => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const [currFilter, setCurrFilter] = useState('Draft');
  const headerTitle = t('lab Manifest', 'Lab Manifest');
  const layout = useLayoutType();
  const { manifests, error, isLoading } = useLabManifests(currFilter);
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

  const handleViewManifestSamples = (manifestUuid: string) => {
    navigate({ to: window.getOpenmrsSpaBase() + `home/lab-manifest/${manifestUuid}` });
  };

  const tableRows =
    results?.map((manifest) => {
      return {
        id: `${manifest.uuid}`,
        startDate: manifest.startDate ? formatDate(parseDate(manifest.startDate)) : '--',
        endDate: manifest.endDate ? formatDate(parseDate(manifest.endDate)) : '--',
        courrier: manifest.courierName ? manifest.courierName : '--',
        labPersonContact: manifest.labPersonContact ?? '--',
        type: manifest.manifestType ?? '--',
        status: manifest.manifestStatus ?? '--',
        dispatch: manifest.dispatchDate ? formatDate(parseDate(manifest.dispatchDate)) : '--',
        manifestId: manifest.manifestId ?? '--',
        actions: (
          <Button
            renderIcon={View}
            hasIconOnly
            kind="tertiary"
            iconDescription={t('view', 'View')}
            onClick={() => handleViewManifestSamples(manifest.uuid)}
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

  if (manifests.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
            <div style={{ padding: '10px' }}>
              <Dropdown
                style={{ minWidth: '300px' }}
                id="manifestStatus"
                onChange={({ selectedItem }) => {
                  setCurrFilter(selectedItem);
                }}
                initialSelectedItem={currFilter}
                label={t('selectManifestStatus', 'Select manifest status')}
                items={LabManifestFilters.map((mn) => mn.value)}
                itemToString={(item) => LabManifestFilters.find((lm) => lm.value === item)?.label ?? ''}
              />
            </div>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>{t('notLabManifetToDisplay', 'There is no lab manifets data to display.')}</p>
        </Tile>
      </Layer>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        <div style={{ padding: '10px' }}>
          <Dropdown
            style={{ minWidth: '300px' }}
            id="manifestStatus"
            onChange={({ selectedItem }) => {
              setCurrFilter(selectedItem);
            }}
            initialSelectedItem={currFilter}
            label={t('selectManifestStatus', 'Select manifest status')}
            items={LabManifestFilters.map((mn) => mn.value)}
            itemToString={(item) => LabManifestFilters.find((lm) => lm.value === item)?.label ?? ''}
          />
        </div>
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
