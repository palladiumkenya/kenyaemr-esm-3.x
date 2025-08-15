import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  DataTableSkeleton,
  Search,
} from '@carbon/react';
import { ExtensionSlot, PrinterIcon, showModal, useConfig, useLayoutType } from '@openmrs/esm-framework';
import styles from '../bed-linelist-view.scss';
import { formatDateTime } from '../../utils/utils';
import { type Patient, type MortuaryLocationResponse } from '../../types';
import { ConfigObject } from '../../config-schema';
import usePatients, { useMortuaryDischargeEncounter } from '../../bed-layout/discharged/discharged-bed-layout.resource';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';
import { Printer } from '@carbon/react/icons';

interface DischargedBedLineListViewProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  paginated?: boolean;
  initialPageSize?: number;
  pageSizes?: number[];
  onPrintGatePass?: (patient: any, encounterDate?: string) => void;
  mutate?: () => void;
}

const DischargedBedLineListView: React.FC<DischargedBedLineListViewProps> = ({
  AdmittedDeceasedPatient,
  isLoading,
  paginated = true,
  initialPageSize = 10,
  pageSizes = [10, 20, 30, 40, 50],
  onPrintGatePass,
  mutate,
}) => {
  const { t } = useTranslation();
  const { morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();
  const isTablet = useLayoutType() === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';

  const [currentPage, setCurrentPage] = useState(1);
  const [currPageSize, setCurrPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    dischargedPatientUuids,
    encounters,
    isLoading: encountersLoading,
    error: encountersError,
  } = useMortuaryDischargeEncounter(morgueDischargeEncounterTypeUuid, AdmittedDeceasedPatient);

  const {
    patients: dischargedPatients,
    isLoading: patientsLoading,
    error: patientsError,
  } = usePatients(dischargedPatientUuids || []);

  const headers = [
    { key: 'name', header: t('name', 'Name') },
    { key: 'idNumber', header: t('idNumber', 'ID Number') },
    { key: 'gender', header: t('gender', 'Gender') },
    { key: 'age', header: t('age', 'Age') },
    { key: 'causeOfDeath', header: t('causeOfDeath', 'Cause of Death') },
    { key: 'dateOfDeath', header: t('dateOfDeath', 'Date of Death') },
    { key: 'daysSinceDeath', header: t('daysSinceDeath', 'Days Since Death') },
    { key: 'dischargeDate', header: t('dischargeDate', 'Discharge Date') },
    { key: 'action', header: t('action', 'Action') },
  ];

  const calculateDaysSinceDeath = useCallback((dateOfDeath: string): number => {
    if (!dateOfDeath) {
      return 0;
    }
    const deathDate = new Date(dateOfDeath);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deathDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }, []);

  const getEncounterDateForPatient = useCallback(
    (patientUuid: string): string | null => {
      if (!encounters || encounters.length === 0) {
        return null;
      }

      const patientEncounter = encounters.find((encounter) => encounter.patient?.uuid === patientUuid);
      return patientEncounter?.encounterDateTime || null;
    },
    [encounters],
  );

  const handlePrintGatePass = useCallback(
    (patient: Patient, encounterDate?: string) => {
      if (onPrintGatePass) {
        onPrintGatePass(patient, encounterDate);
      } else {
        const dispose = showModal('print-confirmation-modal', {
          onClose: () => dispose(),
          patient: patient,
          encounterDate: encounterDate,
        });
      }
    },
    [onPrintGatePass],
  );

  const allRows = useMemo(() => {
    if (!dischargedPatients || dischargedPatients.length === 0) {
      return [];
    }

    const rows = dischargedPatients.map((patient, index) => {
      const patientUuid = patient?.uuid || `patient-${index}`;
      const patientName = patient?.person?.display || '-';
      const gender = patient?.person?.gender || '-';
      const age = patient?.person?.age || '-';
      const causeOfDeath = patient?.person?.causeOfDeath?.display || '-';
      const dateOfDeath = patient?.person?.deathDate;
      const daysSinceDeath = calculateDaysSinceDeath(dateOfDeath);
      const encounterDate = getEncounterDateForPatient(patientUuid);
      const idNumber =
        patient?.identifiers
          ?.find((id) => id.display?.includes('OpenMRS ID'))
          ?.display?.split('=')?.[1]
          ?.trim() || '-';

      return {
        id: patientUuid,
        patient: patient,
        encounterDate: encounterDate,
        idNumber,
        name: patientName,
        gender: gender,
        age: age.toString(),
        causeOfDeath: causeOfDeath,
        dateOfDeath: formatDateTime(dateOfDeath),
        daysSinceDeath: daysSinceDeath.toString(),
        dischargeDate: formatDateTime(encounterDate),
        action: patientUuid,
        searchableText: `${patientName} ${idNumber} ${gender} ${causeOfDeath}`.toLowerCase(),
      };
    });

    return rows;
  }, [dischargedPatients, calculateDaysSinceDeath, getEncounterDateForPatient]);

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

  const goTo = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePaginationChange = useCallback(
    ({ page: newPage, pageSize }: { page: number; pageSize: number }) => {
      if (newPage !== currentPage) {
        goTo(newPage);
      }
      if (pageSize !== currPageSize) {
        setCurrPageSize(pageSize);
        setCurrentPage(1);
      }
    },
    [currentPage, currPageSize, goTo],
  );

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const isLoadingData = isLoading || encountersLoading || patientsLoading;
  const hasSearchTerm = searchTerm.trim().length > 0;
  const hasNoSearchResults = hasSearchTerm && filteredRows.length === 0;
  const hasPatients = dischargedPatients && dischargedPatients.length > 0;
  const totalCount = filteredRows.length;

  if (isLoadingData) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton columnCount={headers.length} rowCount={5} />
      </div>
    );
  }

  if (encountersError || patientsError) {
    return (
      <div className={styles.emptyState}>
        <EmptyState
          headerTitle={t('noDischargedPatients', 'No discharged patients found')}
          displayText={t('noDischargedPatientsDescription', 'There are currently no discharged patients to display.')}
        />
      </div>
    );
  }

  if (!hasPatients) {
    return (
      <div className={styles.emptyState}>
        <EmptyMorgueAdmission title={t('noDischargedPatient', 'No deceased patients currently discharged')} />
      </div>
    );
  }

  const startIndex = (currentPage - 1) * currPageSize;
  const endIndex = startIndex + currPageSize;
  const paginatedRows = paginated ? filteredRows.slice(startIndex, endIndex) : filteredRows;

  const NoSearchResults = () => (
    <div className={styles.emptyState}>
      <EmptyMorgueAdmission title={t('noSearchResults', 'We couldn’t find anything')} />
    </div>
  );

  return (
    <div className={styles.bedLayoutWrapper}>
      <div className={styles.searchContainer}>
        <Search
          labelText={t('searchPatients', 'Search Patients')}
          placeholder={t('searchPatientsPlaceholder', 'Search by name, ID number, gender, or cause of death...')}
          value={searchTerm}
          onChange={handleSearchChange}
          size={controlSize}
        />
      </div>

      {hasNoSearchResults ? (
        <NoSearchResults />
      ) : (
        <>
          <DataTable rows={paginatedRows} headers={headers} isSortable useZebraStyles>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getCellProps }) => (
              <TableContainer>
                <Table {...getTableProps()} aria-label="discharged patients table">
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
                      const rowData = paginatedRows.find((r) => r.id === row.id);
                      const patientData = rowData?.patient;
                      const encounterDate = rowData?.encounterDate;

                      return (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id} {...getCellProps({ cell })}>
                              {cell.info.header === 'action' ? (
                                <div className={styles.actionButtons}>
                                  <OverflowMenu renderIcon={Printer} flipped>
                                    <OverflowMenuItem
                                      onClick={() => handlePrintGatePass(patientData, encounterDate)}
                                      itemText={t('printGatePass', 'Gate Pass')}
                                      disabled={!patientData}
                                    />
                                    <ExtensionSlot
                                      name="print-post-mortem-overflow-menu-item-slot"
                                      state={{ patientUuid: row.id }}
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

          {paginated && !isLoadingData && totalCount > 0 && (
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

export default DischargedBedLineListView;
