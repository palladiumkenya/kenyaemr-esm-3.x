import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  DataTableSkeleton,
  Search,
  Tag,
} from '@carbon/react';
import styles from '../bed-linelist-view.scss';
import { formatDateTime } from '../../utils/utils';
import { type MortuaryLocationResponse, type EnhancedPatient } from '../../types';
import { launchWorkspace, showModal, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';
import { ConfigObject } from '../../config-schema';
import { removeFromMortuaryQueue } from '../../home/home.resource';

interface AwaitingBedLineListViewProps {
  awaitingQueuePatients: Array<EnhancedPatient>;
  mortuaryLocation: MortuaryLocationResponse;
  isLoading: boolean;
  paginated?: boolean;
  initialPageSize?: number;
  pageSizes?: number[];
  mutated?: () => void;
}

const AwaitingBedLineListView: React.FC<AwaitingBedLineListViewProps> = ({
  awaitingQueuePatients,
  isLoading,
  mortuaryLocation,
  paginated = true,
  initialPageSize = 10,
  pageSizes = [10, 20, 30, 40, 50],
  mutated,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';

  const [currentPage, setCurrentPage] = useState(1);
  const [currPageSize, setCurrPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const config = useConfig<ConfigObject>();

  const headers = [
    { key: 'queuedDate', header: t('dateQueued', 'Date Queued') },
    { key: 'idNumber', header: t('idNumber', 'ID Number') },
    { key: 'name', header: t('name', 'Name') },
    { key: 'gender', header: t('gender', 'Gender') },
    { key: 'age', header: t('age', 'Age') },
    { key: 'causeOfDeath', header: t('causeOfDeath', 'Cause of Death') },
    { key: 'daysInQueue', header: t('daysInQueue', 'Days In Queue') },
    { key: 'action', header: t('action', 'Action') },
  ];

  const calculateDaysInQueue = (queuedDate: string): number => {
    if (!queuedDate) {
      return 0;
    }
    const startDate = new Date(queuedDate);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - startDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const allRows = useMemo(() => {
    if (!awaitingQueuePatients || awaitingQueuePatients.length === 0) {
      return [];
    }

    const rows = awaitingQueuePatients.map((patient, index) => {
      const patientUuid = patient?.uuid || `patient-${index}`;
      const patientName = patient?.person?.display || '-';
      const gender = patient?.person?.gender || '-';
      const age = patient?.person?.age || '-';
      const causeOfDeath = patient?.person?.causeOfDeath?.display || '-';
      const queuedDate = patient?.queueInfo?.startedAt;
      const daysInQueue = calculateDaysInQueue(queuedDate);

      const idNumber =
        patient?.identifiers?.find((id) => id.identifierType?.uuid === config.patientIdentifierTypeUuid)?.identifier ||
        '-';
      return {
        id: patientUuid,
        queuedDate: formatDateTime(queuedDate),
        idNumber,
        name: patientName,
        gender: gender,
        age: age.toString(),
        causeOfDeath: causeOfDeath,
        daysInQueue: daysInQueue.toString(),
        action: patientUuid,
        searchableText: `${patientName} ${idNumber} ${gender} ${causeOfDeath}.toLowerCase()`,
      };
    });

    return rows;
  }, [awaitingQueuePatients]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) {
      return allRows;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return allRows.filter(
      (row) =>
        row.searchableText.includes(searchLower) ||
        row.name.toLowerCase().includes(searchLower) ||
        row.idNumber.toLowerCase().includes(searchLower) ||
        row.gender.toLowerCase().includes(searchLower) ||
        row.causeOfDeath.toLowerCase().includes(searchLower),
    );
  }, [allRows, searchTerm]);

  const hasSearchTerm = searchTerm.trim().length > 0;
  const hasNoSearchResults = hasSearchTerm && filteredRows.length === 0;

  const totalCount = filteredRows.length;
  const startIndex = (currentPage - 1) * currPageSize;
  const endIndex = startIndex + currPageSize;
  const paginatedRows = paginated ? filteredRows.slice(startIndex, endIndex) : filteredRows;

  const handleAdmit = (patient: EnhancedPatient) => {
    launchWorkspace('admit-deceased-person-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patient,
      queueEntryUuid: patient.queueInfo?.queueEntryUuid,
      mortuaryLocation,
      mutated,
    });
  };

  const handleRemoveFromQueue = (patient: EnhancedPatient) => {
    const dispose = showModal('delete-confirmation-modal', {
      close: () => dispose(),
      onConfirm: async () => {
        try {
          await removeFromMortuaryQueue(patient.queueInfo?.queueEntryUuid);

          showSnackbar({
            kind: 'success',
            isLowContrast: true,
            title: t('removedFromQueue', 'Removed from queue'),
            subtitle: t('patientRemovedSuccess', '{{patientName}} has been removed from the mortuary queue', {
              patientName: patient.person.display,
            }),
          });

          mutated?.();
        } catch (error) {
          showSnackbar({
            kind: 'error',
            isLowContrast: false,
            title: t('errorRemovingFromQueue', 'Error removing from queue'),
            subtitle: error?.message || t('unexpectedError', 'An unexpected error occurred'),
          });
        }
      },
      modalHeading: t('removeFromQueueConfirmation', 'Remove from mortuary queue?'),
      modalBody: t(
        'removeFromQueueWarning',
        'Are you sure you want to remove {{patientName}} from the mortuary queue? This action cannot be undone.',
        {
          patientName: patient.person.display,
        },
      ),
      primaryButtonText: t('remove', 'Remove'),
      danger: true,
    });
  };

  const goTo = (page: number) => {
    setCurrentPage(page);
  };

  const handlePaginationChange = ({ page: newPage, pageSize }: { page: number; pageSize: number }) => {
    if (newPage !== currentPage) {
      goTo(newPage);
    }
    if (pageSize !== currPageSize) {
      setCurrPageSize(pageSize);
      setCurrentPage(1);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton columnCount={headers.length} rowCount={5} />
      </div>
    );
  }

  if (!awaitingQueuePatients || awaitingQueuePatients.length === 0) {
    return (
      <div>
        <EmptyMorgueAdmission title={t('noQueuePatients', 'No patients in mortuary queue')} />
      </div>
    );
  }

  return (
    <div className={styles.bedLayoutWrapper}>
      <Search
        labelText={t('searchQueuePatients', 'Search queue patients')}
        placeholder={t('searchPlaceholder', 'Search by name, ID, gender, cause of death, or priority...')}
        value={searchTerm}
        onChange={handleSearchChange}
        size={controlSize}
      />
      {hasNoSearchResults ? (
        <EmptyMorgueAdmission title={t('noSearchResults', 'No matching patients found')} />
      ) : (
        <>
          <DataTable rows={paginatedRows} headers={headers} isSortable useZebraStyles>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
              <TableContainer>
                <Table {...getTableProps()} aria-label="mortuary queue table">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          key={header.key}
                          {...getHeaderProps({
                            header,
                          })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const patient = awaitingQueuePatients.find((p) => p?.uuid === row.id);

                      return (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id} {...getCellProps({ cell })}>
                              {cell.info.header === 'action' ? (
                                <div className={styles.actionButtons}>
                                  <OverflowMenu flipped>
                                    <OverflowMenuItem
                                      onClick={() => handleAdmit(patient)}
                                      itemText={t('admit', 'Admit')}
                                      disabled={!patient}
                                    />
                                    <OverflowMenuItem
                                      onClick={() => handleRemoveFromQueue(patient)}
                                      itemText={t('releaseBody', 'Release body')}
                                      disabled={!patient}
                                    />
                                  </OverflowMenu>
                                </div>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>

          {paginated && !isLoading && totalCount > 0 && (
            <Pagination
              page={currentPage}
              pageSize={currPageSize}
              pageSizes={pageSizes}
              totalItems={totalCount}
              size={'sm'}
              onChange={handlePaginationChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AwaitingBedLineListView;
