import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { launchWorkspace, showModal, useConfig } from '@openmrs/esm-framework';
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
      <div className={styles.emptyState}>
        <p>{t('noDischargedPatients', 'No discharged patients found')}</p>
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
    </div>
  );
};

export default DischargedBedLayout;
