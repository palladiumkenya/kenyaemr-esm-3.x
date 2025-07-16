import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { launchWorkspace, useConfig } from '@openmrs/esm-framework';
import styles from '../bed-layout.scss';
import { type MortuaryLocationResponse } from '../../types';
import { ConfigObject } from '../../config-schema';
import { mutate as mutateSWR } from 'swr';
import usePatients, { useMortuaryDischargeEncounter } from './discharged-bed-layout.resource';
import BedCard from '../../bed/bed.component';

interface BedLayoutProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  onPrintGatePass?: (patientUuid: string) => void;
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
    isLoading: encountersLoading,
    error: encountersError,
  } = useMortuaryDischargeEncounter(morgueDischargeEncounterTypeUuid, AdmittedDeceasedPatient);

  const {
    patients: dischargedPatients,
    isLoading: patientsLoading,
    error: patientsError,
  } = usePatients(dischargedPatientUuids || []);

  const handlePrintGatePass = (patientUuid: string) => {
    if (onPrintGatePass) {
      onPrintGatePass(patientUuid);
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

          return (
            <BedCard
              key={patientUuid}
              patientName={patientName}
              gender={gender}
              age={age}
              causeOfDeath={causeOfDeath}
              dateOfDeath={dateOfDeath}
              patientUuid={patientUuid}
              onPrintGatePass={() => handlePrintGatePass(patientUuid)}
              onPrintPostmortem={() => handlePrintPostmortem(patientUuid)}
              isDischarged={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DischargedBedLayout;
