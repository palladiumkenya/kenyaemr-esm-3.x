import React from 'react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, showModal, useConfig } from '@openmrs/esm-framework';
import { DataTableSkeleton, InlineLoading, Pagination } from '@carbon/react';
import styles from '../bed-layout.scss';
import { Patient, type MortuaryLocationResponse } from '../../types';
import { ConfigObject } from '../../config-schema';
import { mutate as mutateSWR } from 'swr';
import usePatients, { useMortuaryDischargeEncounter } from './discharged-bed-layout.resource';
import BedCard from '../../bed/bed.component';

interface BedLayoutProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  onPrintGatePass?: (patient: Patient, encounterDate?: string) => void;
  onPrintPostmortem?: (patientUuid: string) => void;
  mutate?: () => void;
}

const DischargedBedLayout: React.FC<BedLayoutProps> = ({
  AdmittedDeceasedPatient,
  isLoading,
  onPrintGatePass,
  onPrintPostmortem,
  mutate,
}) => {
  const { t } = useTranslation();
  const { morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();

  const {
    dischargedPatientUuids,
    encounters,
    isLoading: encountersLoading,
    error: encountersError,
    currentPage,
    totalCount,
    currPageSize,
    setCurrPageSize,
    goTo,
  } = useMortuaryDischargeEncounter(morgueDischargeEncounterTypeUuid, AdmittedDeceasedPatient);

  const {
    patients: dischargedPatients,
    isLoading: patientsLoading,
    error: patientsError,
  } = usePatients(dischargedPatientUuids || []);

  const getEncounterDateForPatient = (patientUuid: string): string | null => {
    if (!encounters || encounters.length === 0) {
      return null;
    }

    const patientEncounter = encounters.find((encounter) => encounter.patient?.uuid === patientUuid);

    return patientEncounter?.encounterDateTime || null;
  };

  const handlePrintGatePass = (patient: Patient, encounterDate?: string) => {
    if (onPrintGatePass) {
      onPrintGatePass(patient, encounterDate);
    } else {
      const dispose = showModal('print-confirmation-modal', {
        onClose: () => dispose(),
        patient: patient,
        encounterDate: encounterDate,
      });
    }
  };

  const handlePrintPostmortem = (patientUuid: string) => {
    if (onPrintPostmortem) {
      onPrintPostmortem(patientUuid);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setCurrPageSize(newPageSize);
    // Reset to first page when changing page size
    goTo(1);
  };

  if (isLoading || encountersLoading || patientsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  if (encountersError || patientsError) {
    return (
      <div className={styles.emptyState}>
        <p>{t('errorLoadingPatients', 'Error loading discharged patients')}</p>
      </div>
    );
  }

  if (!dischargedPatients || dischargedPatients.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton columnCount={5} rowCount={5} zebra />
      </div>
    );
  }

  return (
    <div className={styles.bedLayoutWrapper}>
      <div className={styles.bedLayoutContainer}>
        {dischargedPatients.map((patient) => {
          const patientUuid = patient?.uuid;
          const patientName = patient?.person?.display;
          const gender = patient?.person?.gender;
          const age = patient?.person?.age;
          const causeOfDeath = patient?.person?.causeOfDeath?.display;
          const dateOfDeath = patient?.person?.deathDate;
          const encounterDate = getEncounterDateForPatient(patientUuid);

          return (
            <BedCard
              key={patientUuid}
              patientName={patientName}
              gender={gender}
              age={age}
              causeOfDeath={causeOfDeath}
              dateOfDeath={dateOfDeath}
              patientUuid={patientUuid}
              onPrintGatePass={() => handlePrintGatePass(patient, encounterDate)}
              isDischarged={true}
            />
          );
        })}
      </div>

      <div className={styles.paginationFooter}>
        <Pagination
          page={currentPage || 1}
          totalItems={totalCount || 0}
          pageSize={currPageSize}
          pageSizes={[10, 20, 50, 100]}
          onChange={({ page, pageSize }: { page: number; pageSize: number }) => {
            if (pageSize !== currPageSize) {
              setCurrPageSize(pageSize);
              goTo(1);
            } else {
              goTo(page);
            }
          }}
        />
      </div>
    </div>
  );
};

export default DischargedBedLayout;
