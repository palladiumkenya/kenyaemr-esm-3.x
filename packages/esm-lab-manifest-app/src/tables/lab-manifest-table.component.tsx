import {
  DataTable,
  DataTableSkeleton,
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
  Tile,
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
import { EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LabManifestConfig } from '../config-schema';
import LabManifestTableFilterHeader from '../header/lab-manifest-table-filters-header.component';
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
        header: t('endDate', 'End date'),
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
        header: t('labPersonContact', 'Lab person contact'),
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
    navigate({ to: window.getOpenmrsSpaBase() + `lab-manifest/detail/${manifestUuid}` });
  };

  const handleEditManifest = (manifest: MappedLabManifest) => {
    launchWorkspace('lab-manifest-form', {
      workspaceTitle: 'Lab Manifest Form',
      manifest,
    });
  };

  const handlePrintManifest = async (manifest: MappedLabManifest, log: boolean = false) => {
    try {
      await printManifest(manifest.uuid, log);
    } catch (error) {
      showSnackbar({ title: 'Failure', subtitle: 'Error printing manifest', kind: 'error' });
    }
  };

  const handleLaunchRequeueConfirmModal = useCallback(
    (labManifest: MappedLabManifest) => {
      const dispose = showModal('lab-manifest-requeue-confirm-modal', {
        labManifest,
        onClose: () => dispose(),
        filter: currFilter,
      });
    },
    [currFilter],
  );

  const tableRows = useMemo(
    () =>
      (
        results?.map((manifest) => {
          return {
            id: `${manifest.uuid}`,
            startDate: parseDate(manifest.startDate),
            endDate: manifest.endDate ? parseDate(manifest.endDate) : '--',
            courrier: manifest.courierName ? manifest.courierName : '--',
            labPersonContact: manifest.labPersonContact ?? '--',
            type: labmanifestTypes.find((type) => `${type.id}` === manifest?.manifestType)?.type ?? '--',
            status: manifest.manifestStatus ?? '--',
            dispatch: manifest.dispatchDate ? parseDate(manifest.dispatchDate) : '--',
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
                  <>
                    <OverflowMenuItem
                      itemText={t('printManifest', 'Print Manifest')}
                      onClick={() => handlePrintManifest(manifest)}
                    />
                    <OverflowMenuItem
                      itemText={t('printManifestLog', 'Print Manifest Log')}
                      onClick={() => handlePrintManifest(manifest, true)}
                    />
                  </>
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
        }) ?? []
      ).sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
    [results, handleLaunchRequeueConfirmModal, labmanifestTypes, size, t],
  );

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }
  function customSortRow(cellA, cellB, { sortDirection, sortStates, locale, key, compare }) {
    // Convert Date objects to timestamps for comparison
    const valueA = cellA instanceof Date ? cellA.getTime() : cellA;
    const valueB = cellB instanceof Date ? cellB.getTime() : cellB;
    if (sortDirection === sortStates.DESC) {
      return compare(valueB, valueA, locale);
    }

    return compare(valueA, valueB, locale);
  }

  if (manifests.length === 0) {
    return (
      <Layer className={styles.tile}>
        <LabManifestTableFilterHeader filter={currFilter} onFilterChange={setCurrFilter} title={headerTitle} />
        <Tile>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t('notLabManifetToDisplay', 'There are no {{status}} lab manifets data to display.', {
              status: LabManifestFilters.find((lm) => lm.params === currFilter)?.label ?? '',
            })}
          </p>
        </Tile>
      </Layer>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <main className="omrs-main-content">
        <LabManifestTableFilterHeader filter={currFilter} onFilterChange={setCurrFilter} title={headerTitle} />
        <DataTable
          useZebraStyles
          size="sm"
          rows={tableRows ?? []}
          sortRow={customSortRow}
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
                          isSortable: true,
                        })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => {
                        const value = cell.value instanceof Date ? formatDate(cell.value) : cell.value;
                        return <TableCell key={cell.id}>{value}</TableCell>;
                      })}
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
      </main>
    </div>
  );
};

export default LabManifestsTable;
