import {
  Button,
  ButtonSet,
  DataTable,
  DataTableSkeleton,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
} from '@carbon/react';
import { ArrowRight, Printer, TrashCan } from '@carbon/react/icons';
import { ErrorState, formatDate, parseDate, showModal, showSnackbar, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLabManifest } from '../hooks';
import useLabManifestOrders, { LabManifestSample } from '../hooks/useLabManifestOrders';
import {
  mutateManifestLinks,
  printSpecimentLabel,
  removeSampleFromTheManifest,
  sampleRemovableManifestStatus,
} from '../lab-manifest.resources';
import styles from './lab-manifest-table.scss';
import PatientCCCNumbercell from './patient-ccc-no-cell.component';
import PatientNameCell from './patient-name-cell.component';

interface LabManifestSamplesProps {
  manifestUuid: string;
}

const LabManifestSamples: React.FC<LabManifestSamplesProps> = ({ manifestUuid }) => {
  const { error, isLoading, manifest } = useLabManifest(manifestUuid);
  const {
    labmanifestOrders,
    setSearchvalue,
    searchValue,
    isLoading: isLoadingLabOrders,
    error: labOrderErrors,
  } = useLabManifestOrders(manifestUuid);
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const headerTitle = t('labManifestSamples', 'Lab Manifest Samples');
  const { results, totalPages, currentPage, goTo } = usePagination(labmanifestOrders, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);

  const headers = [
    {
      header: t('patient', 'Patient'),
      key: 'patientName',
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
      header: t('status', 'Status'),
      key: 'status',
    },
    {
      header: t('dateRequested', 'Date Requested'),
      key: 'dateRequested',
      isSortable: true,
    },
    {
      header: t('resultDate', 'Result Date'),
      key: 'resultDate',
      isSortable: true,
    },
    {
      header: t('result', 'Result'),
      key: 'result',
    },
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const handleDeleteManifestSample = (sampleUUid: string) => {
    const dispose = showModal('sample-delete-confirm-dialog', {
      onClose: () => dispose(),
      samples: labmanifestOrders.filter((s) => s.uuid === sampleUUid),
      onDelete: async () => {
        try {
          await removeSampleFromTheManifest(sampleUUid);
          mutateManifestLinks(manifest?.uuid, manifest?.manifestStatus);
          dispose();
          showSnackbar({
            title: 'Success',
            kind: 'success',
            subtitle: t('sampleRemoveSuccess', 'Sample removed from manifest successfully!'),
          });
        } catch (e: any) {
          const _sample = labmanifestOrders.find((sample) => sample.uuid === sampleUUid);
          showSnackbar({
            title: t('errorRemovingSample', 'Error removing sample {{sample}} from the manifest', {
              sample: _sample.id ?? _sample?.uuid,
            }),
            kind: 'error',
            subtitle: `${e?.responseBody?.error?.message ?? e?.message} `,
          });
        }
      },
    });
  };

  const handleDeleteSelectedSamples = (selected: Array<LabManifestSample>) => {
    if (selected.length > 0) {
      const dispose = showModal('sample-delete-confirm-dialog', {
        onClose: () => dispose(),
        samples: selected,
        onDelete: async () => {
          try {
            const samplesDeletionAsyncTasks = await Promise.allSettled(
              selected.map(({ uuid }) => removeSampleFromTheManifest(uuid)),
            );
            mutateManifestLinks(manifest?.uuid, manifest?.manifestStatus);
            dispose();
            samplesDeletionAsyncTasks.forEach((task, index) => {
              const _sample = selected[index];

              if (task.status === 'rejected') {
                showSnackbar({
                  title: t('errorRemovingSample', 'Error removing sample {{sample}} from the manifest', {
                    sample: _sample.id ?? _sample.uuid,
                  }),
                  kind: 'error',
                  subtitle: `${task.reason?.responseBody?.error?.message ?? task.reason?.message} `,
                });
              } else {
                showSnackbar({
                  title: 'Success',
                  kind: 'success',
                  subtitle: 'Sample removed from manifest successfully!',
                });
              }
            });
          } catch (e) {
            showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error removing sample from the manifest' });
          }
        },
      });
    }
  };

  async function handlePrintSpecimenLabel(sample: LabManifestSample) {
    try {
      await printSpecimentLabel(sample.uuid);
    } catch (error) {
      showSnackbar({ title: 'Failure', subtitle: 'Error specimen label', kind: 'error' });
    }
  }

  const tableRows =
    results?.map((sample) => {
      return {
        id: `${sample.uuid}`,
        sampleType: sample.sampleType ?? '--',
        status: sample.status,
        batchNumber: sample.batchNumber ?? '--',
        patientName: <PatientNameCell patient={sample?.order?.patient} />,
        cccKDODNumber: sample?.order?.patient ? (
          <PatientCCCNumbercell patientUuid={sample?.order?.patient?.uuid} />
        ) : (
          '--'
        ),
        dateRequested: sample.dateSent ? formatDate(parseDate(sample.dateSent)) : '--',
        resultDate: sample.resultDate ? formatDate(parseDate(sample.resultDate)) : '--',
        result: sample.result ?? '--',
        actions: (
          <ButtonSet className={styles.btnSet}>
            {sampleRemovableManifestStatus.includes(manifest?.manifestStatus) && (
              <Button
                renderIcon={TrashCan}
                className={styles.btn}
                hasIconOnly
                kind="ghost"
                iconDescription={t('removeFromManifest', 'Remove from Manifest')}
                onClick={() => handleDeleteManifestSample(sample.uuid)}
              />
            )}
            <Button
              className={styles.btn}
              renderIcon={Printer}
              hasIconOnly
              kind="ghost"
              iconDescription={t('printSpecimenLabel', 'Print Specimen Label')}
              onClick={() => handlePrintSpecimenLabel(sample)}
            />
          </ButtonSet>
        ),
      };
    }) ?? [];

  if (isLoading || isLoadingLabOrders) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error || labOrderErrors) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (labmanifestOrders.length === 0) {
    return (
      <EmptyState
        headerTitle={t('manifestSamples', 'Manifest Samples')}
        displayText={t('labManifestSamples', 'Lab manifest samples')}
      />
    );
  }

  return (
    <div className={styles.widgetContainer}>
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows ?? []}
        headers={headers}
        render={({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getTableProps,
          getTableContainerProps,
          selectedRows,
        }) => (
          <>
            <CardHeader title={headerTitle}>
              <Button
                onClick={() => {
                  const data = selectedRows.map(({ id }) => labmanifestOrders.find((s) => s.uuid === id));
                  handleDeleteSelectedSamples(data);
                }}
                renderIcon={ArrowRight}
                kind="ghost">
                {t('deleteSelectedSamples', 'Remove Selected Samples')}
              </Button>
            </CardHeader>
            <Search labelText={''} value={searchValue} onChange={({ target: { value } }) => setSearchvalue(value)} />
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableSelectAll {...getSelectionProps()} />
                    {headers.map((header, i) => (
                      <TableHeader key={i} {...getHeaderProps({ header, isSortable: true })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i} {...getRowProps({ row })} onClick={(evt) => {}}>
                      <TableSelectRow {...getSelectionProps({ row })} />
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      />

      <Pagination
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizes}
        totalItems={labmanifestOrders.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default LabManifestSamples;
