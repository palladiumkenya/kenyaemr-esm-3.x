// DischargedBedLineListView.tsx
import React, { useState, useMemo } from 'react';
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
} from '@carbon/react';
import { showModal, useConfig } from '@openmrs/esm-framework';
import styles from '../bed-linelist-view.scss';
import { formatDateTime } from '../../utils/utils';
import { type MortuaryLocationResponse } from '../../types';
import { ConfigObject } from '../../config-schema';
import usePatients, { useMortuaryDischargeEncounter } from '../../bed-layout/discharged/discharged-bed-layout.resource';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

interface DischargedBedLineListViewProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  paginated?: boolean;
  initialPageSize?: number;
  pageSizes?: number[];
  onPrintGatePass?: (patientUuid: string) => void;
  onPrintPostmortem?: (patientUuid: string) => void;
  mutate?: () => void;
}

const DischargedBedLineListView: React.FC<DischargedBedLineListViewProps> = ({
  AdmittedDeceasedPatient,
  isLoading,
  paginated = true,
  initialPageSize = 10,
  pageSizes = [10, 20, 30, 40, 50],
  onPrintGatePass,
  onPrintPostmortem,
  mutate,
}) => {
  const { t } = useTranslation();
  const { morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();

  const [currentPage, setCurrentPage] = useState(1);
  const [currPageSize, setCurrPageSize] = useState(initialPageSize);

  const {
    dischargedPatientUuids,
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
    { key: 'action', header: t('action', 'Action') },
  ];

  const calculateDaysSinceDeath = (dateOfDeath: string): number => {
    if (!dateOfDeath) {
      return 0;
    }
    const deathDate = new Date(dateOfDeath);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deathDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  };

  const handlePrintGatePass = (patientUuid: string) => {
    if (onPrintGatePass) {
      onPrintGatePass(patientUuid);
    } else {
      // Find the specific patient data
      const patientData = dischargedPatients.find((patient) => patient?.uuid === patientUuid);

      if (patientData) {
        // Create the deceased person details object
        const deceasedPersonDetails = {
          uuid: patientData.uuid,
          person: {
            display: patientData.person?.display || '',
            age: patientData.person?.age || 0,
            gender: patientData.person?.gender || '',
            birthdate: patientData.person?.birthdate || '',
            deathDate: patientData.person?.deathDate || '',
            causeOfDeath: patientData.person?.causeOfDeath || null,
          },
          identifiers: patientData.identifiers || [],
          admissionDate: patientData.uuid || '', // You might need to get this from encounter data
          // Optional fields - you can populate these from your data source or leave as defaults
          paperNumber: '',
          paymentMethod: '',
          accountOfficer: '',
          nurseInCharge: '',
          securityGuard: '',
        };

        const dispose = showModal('print-confirmation-modal', {
          onClose: () => dispose(),
          deceasedPersonDetails: deceasedPersonDetails,
        });
      }
    }
  };

  const handlePrintPostmortem = (patientUuid: string) => {
    if (onPrintPostmortem) {
      onPrintPostmortem(patientUuid);
    }
  };

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

      return {
        id: patientUuid,
        idNumber:
          patient?.identifiers
            ?.find((id) => id.display?.includes('OpenMRS ID'))
            ?.display?.split('=')?.[1]
            ?.trim() || '-',
        name: patientName,
        gender: gender,
        age: age.toString(),
        causeOfDeath: causeOfDeath,
        dateOfDeath: formatDateTime(dateOfDeath),
        daysSinceDeath: daysSinceDeath.toString(),
        action: patientUuid,
      };
    });

    return rows;
  }, [dischargedPatients]);

  const totalCount = allRows.length;
  const startIndex = (currentPage - 1) * currPageSize;
  const endIndex = startIndex + currPageSize;
  const paginatedRows = paginated ? allRows.slice(startIndex, endIndex) : allRows;

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

  const isLoadingData = isLoading || encountersLoading || patientsLoading;

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
        />{' '}
      </div>
    );
  }

  if (!dischargedPatients || dischargedPatients.length === 0) {
    return (
      <div className={styles.emptyState}>
        <EmptyState
          headerTitle={t('noDischargedPatients', 'No discharged patients found')}
          displayText={t('noDischargedPatientsDescription', 'There are currently no discharged patients to display.')}
        />
      </div>
    );
  }

  return (
    <div className={styles.bedLayoutWrapper}>
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
                  const patientData = dischargedPatients.find((patient) => patient?.uuid === row.id);
                  const patientName = patientData?.person?.display || '';

                  return (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} {...getCellProps({ cell })}>
                          {cell.info.header === 'action' ? (
                            <div className={styles.actionButtons}>
                              <OverflowMenu flipped>
                                <OverflowMenuItem
                                  onClick={() => handlePrintGatePass(row.id)}
                                  itemText={t('printGatePass', 'Gate Pass')}
                                  disabled={!patientData}
                                />
                                <OverflowMenuItem
                                  onClick={() => handlePrintPostmortem(row.id)}
                                  itemText={t('printPostmortem', 'Postmortem')}
                                  disabled={!patientData}
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
    </div>
  );
};

export default DischargedBedLineListView;
