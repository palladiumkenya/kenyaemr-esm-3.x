import {
  DataTable,
  DataTableSkeleton,
  Dropdown,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import {
  ErrorState,
  formatDate,
  launchWorkspace,
  navigate,
  parseDate,
  showModal,
  showSnackbar,
  useConfig,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LabManifestConfig } from '../config-schema';
import { useLabManifests } from '../hooks';
import {
  editableManifestStatus,
  LabManifestFilters,
  printableManifestStatus,
  printManifest,
  resubmittableManifestStatus,
} from '../lab-manifest.resources';
import { MappedLabManifest } from '../types';
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
  const { labmanifestTypes } = useConfig<LabManifestConfig>();
  const size = layout === 'tablet' ? 'lg' : 'md';
  const headers = useMemo(
    () => [
      {
        header: t('startDate', 'Start date'),
        key: 'startDate',
        isSortable: true,
      },
      {
        header: t('endDate', 'End Date'),
        key: 'endDate',
        isSortable: true,
      },
      {
        header: t('type', 'Type'),
        key: 'type',
        isSortable: true,
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
        isSortable: true,
      },
      {
        header: t('samples', 'Samples'),
        key: 'samples',
      },
      {
        header: t('actions', 'Actions'),
        key: 'actions',
      },
    ],
    [t],
  );

  const handleViewManifestSamples = (manifestUuid: string) => {
    navigate({ to: window.getOpenmrsSpaBase() + `home/lab-manifest/${manifestUuid}` });
  };

  const handleEditManifest = (manifest: MappedLabManifest) => {
    launchWorkspace('lab-manifest-form', {
      workspaceTitle: 'Lab Manifest Form',
      manifest,
    });
  };

  const handlePrintManifest = async (manifest: MappedLabManifest) => {
    try {
      await printManifest(manifest.uuid, manifest.manifestStatus);
    } catch (error) {
      showSnackbar({ title: 'Failure', subtitle: 'Error printing manifest', kind: 'error' });
    }
  };

  const handleLaunchRequeueConfirmModal = (labManifest: MappedLabManifest) => {
    const dispose = showModal('lab-manifest-requeue-confirn-modal', {
      labManifest,
      onClose: () => dispose(),
      filter: currFilter,
    });
  };

  const tableRows = useMemo(
    () =>
      results?.map((manifest) => {
        return {
          id: `${manifest.uuid}`,
          startDate: manifest.startDate ? formatDate(parseDate(manifest.startDate)) : '--',
          endDate: manifest.endDate ? formatDate(parseDate(manifest.endDate)) : '--',
          courrier: manifest.courierName ? manifest.courierName : '--',
          labPersonContact: manifest.labPersonContact ?? '--',
          type: labmanifestTypes.find((type) => `${type.id}` === manifest?.manifestType)?.type ?? '--',
          status: manifest.manifestStatus ?? '--',
          dispatch: manifest.dispatchDate ? formatDate(parseDate(manifest.dispatchDate)) : '--',
          manifestId: manifest.manifestId ?? '--',
          samples: `${manifest.samples.length}`,
          actions: (
            <OverflowMenu flipped size={size} aria-label="overflow-menu">
              <OverflowMenuItem
                itemText={t('viewManifest', 'View Manifest')}
                onClick={() => handleViewManifestSamples(manifest.uuid)}
              />
              {editableManifestStatus.includes(manifest.manifestStatus) && (
                <OverflowMenuItem
                  itemText={t('editmanifest', 'Edit Manifest')}
                  onClick={() => handleEditManifest(manifest)}
                />
              )}
              {printableManifestStatus.includes(manifest.manifestStatus) && (
                <OverflowMenuItem
                  itemText={t('printManifest', 'Print Manifest')}
                  onClick={() => handlePrintManifest(manifest)}
                />
              )}
              {resubmittableManifestStatus.includes(manifest.manifestStatus) && (
                <OverflowMenuItem
                  itemText={t('requeueManifest', 'Requeue Manifest')}
                  onClick={() => handleLaunchRequeueConfirmModal(manifest)}
                />
              )}
            </OverflowMenu>
          ),
        };
      }) ?? [],
    [results, t],
  );

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (manifests.length === 0) {
    return (
      <Layer className={styles.tile}>
        <CardHeader title={headerTitle}>
          <Dropdown
            className={styles.dropDownFilter}
            id="manifestStatus"
            onChange={({ selectedItem }) => {
              setCurrFilter(LabManifestFilters.find((lb) => lb.value === selectedItem).params);
            }}
            initialSelectedItem={LabManifestFilters.find((lb) => lb.params === currFilter).value}
            label={t('selectManifestStatus', 'Select manifest status')}
            items={LabManifestFilters.map((mn) => mn.value)}
            itemToString={(item) => LabManifestFilters.find((lm) => lm.value === item)?.label ?? ''}
          />
        </CardHeader>
        <EmptyDataIllustration />
        <p className={styles.content}>
          {t('notLabManifetToDisplay', 'There are no {{status}} lab manifets data to display.', {
            status: LabManifestFilters.find((lm) => lm.params === currFilter)?.label ?? '',
          })}
        </p>
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
              setCurrFilter(LabManifestFilters.find((lb) => lb.value === selectedItem).params);
            }}
            initialSelectedItem={LabManifestFilters.find((lb) => lb.params === currFilter).value}
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
