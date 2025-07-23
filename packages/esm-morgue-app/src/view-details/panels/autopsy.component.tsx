import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatDate,
  isDesktop,
  launchWorkspace,
  parseDate,
  useConfig,
  useLayoutType,
  usePagination,
  showModal,
  showSnackbar,
} from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  getPatientUuidFromStore,
  usePaginationInfo,
} from '@openmrs/esm-patient-common-lib';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  OverflowMenu,
  OverflowMenuItem,
  TableExpandHeader,
  DataTableSkeleton,
  TableExpandRow,
  TableExpandedRow,
  Pagination,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import styles from './panels.scss';
import { ConfigObject } from '../../config-schema';
import EncounterObservations from './observations/observation.component';
import { Observation } from '../../types';
import { useAutospyEncounter } from '../view-details.resource';
// import { deleteEncounter } from '../case-encounter-table.resource'; // Import delete function
import { useParams } from 'react-router-dom';

interface RouteParams {
  patientUuid: string;
  [key: string]: string | undefined;
}

const AutopsyView: React.FC = () => {
  const { t } = useTranslation();
  const { patientUuid } = useParams<RouteParams>();

  const { autopsyFormUuid, autopsyEncounterFormUuid } = useConfig<ConfigObject>();

  const { encounters, isLoading, error, mutate, isValidating } = useAutospyEncounter(
    patientUuid,
    autopsyEncounterFormUuid,
  );

  const headerTitle = t('autopsyReport', 'Autopsy report');
  const layout = useLayoutType();
  const [pageSize, setPageSize] = React.useState(10);
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { paginated, goTo, results, currentPage } = usePagination(encounters, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, encounters?.length, currentPage, results?.length);

  const handleLaunchAutopsyForm = (encounterUUID = '') => {
    const workspaceTitle = encounterUUID
      ? t('editAutopsyReport', 'Edit Autopsy Report')
      : t('addAutopsyReport', 'Add Autopsy Report');

    launchWorkspace('mortuary-form-entry', {
      workspaceTitle,
      mutateForm: () => {
        mutate();
      },
      formUuid: autopsyFormUuid, // Pass formUuid directly as a top-level property
      encounterUuid: encounterUUID,
      patientUuid,
      visitTypeUuid: '',
      visitUuid: '',
    });
  };

  // Delete Encounter Handler
  // const handleDeleteAutopsyEncounter = React.useCallback(
  //   (encounterUuid: string, encounterTypeName?: string) => {
  //     console.log('Attempting to delete encounter:', encounterUuid);
  //     const close = showModal('delete-encounter-modal', {
  //       close: () => close(),
  //       encounterTypeName: encounterTypeName || t('autopsyReport', 'Autopsy Report'),
  //       onConfirmation: () => {
  //         const abortController = new AbortController();
  //         deleteEncounter(encounterUuid, abortController)
  //           .then(() => {
  //             console.log('Successfully deleted encounter:', encounterUuid);
  //             mutate(); // Refresh autopsy encounters
  //             showSnackbar({
  //               isLowContrast: true,
  //               title: t('autopsyDeleted', 'Autopsy report deleted'),
  //               subtitle: `${t('autopsyReport', 'Autopsy report')} ${t('successfullyDeleted', 'successfully deleted')}`,
  //               kind: 'success',
  //             });
  //           })
  //           .catch((error) => {
  //             console.error('Error deleting encounter:', error);
  //             showSnackbar({
  //               isLowContrast: false,
  //               title: t('error', 'Error'),
  //               subtitle: `${t('autopsyReport', 'Autopsy report')} ${t('failedDeleting', "couldn't be deleted")}`,
  //               kind: 'error',
  //             });
  //           });
  //         close();
  //       },
  //     });
  //   },
  //   [t, mutate],
  // );

  const tableHeader = [
    {
      key: 'date',
      header: t('dateTime', 'Date & time'),
    },
    {
      key: 'visitType',
      header: t('visitType', 'Visit type'),
    },
    {
      key: 'encounterType',
      header: t('encounterType', 'Encounter type'),
    },
    {
      key: 'formName',
      header: t('formName', 'Form name'),
    },
    {
      key: 'mortician',
      header: t('mortician', 'Mortician name'),
    },
    {
      key: 'action',
      header: t('action', 'Action'),
    },
  ];

  if (isLoading) {
    return <DataTableSkeleton headers={tableHeader} aria-label={headerTitle} />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (!encounters || encounters.length === 0) {
    return <EmptyState displayText={headerTitle} headerTitle={headerTitle} launchForm={handleLaunchAutopsyForm} />;
  }

  // Map encounters to table rows with enhanced actions
  const tableRows = encounters.map((encounter) => {
    const row = {
      id: `${encounter.uuid}`,
      date: formatDate(parseDate(encounter?.encounterDatetime)),
      visitType: encounter?.visit?.visitType?.display ?? '--',
      encounterType: encounter?.encounterType?.display ?? '--',
      formName: encounter?.form?.name ?? '--',
      mortician: encounter?.encounterProviders?.[0]?.provider?.name ?? '--',
      action: (
        <OverflowMenu aria-label="autopsy-actions" flipped={false}>
          <OverflowMenuItem onClick={() => handleLaunchAutopsyForm(encounter.uuid)} itemText={t('edit', 'Edit')} />
          {/* <OverflowMenuItem
            onClick={() => handleDeleteAutopsyEncounter(encounter.uuid, encounter?.encounterType?.display)}
            itemText={t('delete', 'Delete')}
            hasDivider
            isDelete
          /> */}
        </OverflowMenu>
      ),
      obs: encounter?.obs,
    };
    return row;
  });

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <Button
          size="md"
          kind="ghost"
          onClick={() => handleLaunchAutopsyForm()}
          renderIcon={(props) => <Add size={24} {...props} />}
          iconDescription={t('addAutopsyReport', 'Add Autopsy Report')}>
          {t('add', 'Add')}
        </Button>
      </CardHeader>

      <DataTable isSortable rows={tableRows} headers={tableHeader} size={responsiveSize} useZebraStyles>
        {({
          rows,
          headers,
          getExpandHeaderProps,
          getTableProps,
          getTableContainerProps,
          getHeaderProps,
          getRowProps,
        }) => {
          return (
            <TableContainer {...getTableContainerProps}>
              <Table className={styles.table} {...getTableProps()} aria-label="Autopsy reports list">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header, i) => (
                      <TableHeader
                        key={i}
                        {...getHeaderProps({
                          header,
                        })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => {
                    const encounter = encounters.find((enc) => enc.uuid === row.id);

                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded && encounter ? (
                          <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                            <div className={styles.container} key={i}>
                              <EncounterObservations
                                observations={encounter.obs as Observation[]}
                                // title={t('autopsyFindings', 'Autopsy Findings')}
                              />
                            </div>
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }}
      </DataTable>

      {paginated && (
        <Pagination
          forwardText={t('nextPage', 'Next page')}
          backwardText={t('previousPage', 'Previous page')}
          page={currentPage}
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={encounters.length}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ page: newPage, pageSize }) => {
            if (newPage !== currentPage) {
              goTo(newPage);
            }
            setPageSize(pageSize);
          }}
        />
      )}
    </div>
  );
};

export default AutopsyView;
