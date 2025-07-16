import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, SkeletonText } from '@carbon/react';
import styles from '../bed-layout.scss';
import BedCard from '../../bed/bed.component';
import { MortuaryPatient, MortuaryLocationResponse } from '../../types';
import { useAwaitingPatients } from '../../home/home.resource';
import { launchWorkspace } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib/src';

interface BedLayoutProps {
  awaitingQueueDeceasedPatients: MortuaryPatient[];
  mortuaryLocation: MortuaryLocationResponse;
  isLoading: boolean;
  mutated?: () => void;
}

const AwaitingBedLayout: React.FC<BedLayoutProps> = ({
  awaitingQueueDeceasedPatients,
  mortuaryLocation,
  isLoading,
  mutated,
}) => {
  const { t } = useTranslation();

  const trulyAwaitingPatients = useAwaitingPatients(awaitingQueueDeceasedPatients);

  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <SkeletonText />
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  if (trulyAwaitingPatients.length === 0) {
    return (
      <div className={styles.emptyState}>
        <EmptyState
          headerTitle={t('noAwaitingPatients', 'No awaiting patients found')}
          displayText={t('noAwaitingPatientsDescription', 'There are currently no awaiting patients to display.')}
        />
      </div>
    );
  }

  const handleAdmit = (patientData: MortuaryPatient) => {
    launchWorkspace('admit-deceased-person-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patientData,
      mortuaryLocation,
      mutated,
    });
  };

  return (
    <div className={styles.bedLayoutWrapper}>
      <div className={styles.bedLayoutContainer}>
        {trulyAwaitingPatients.map((mortuaryPatient) => {
          const patientUuid = mortuaryPatient?.person?.person?.uuid;
          const patientName = mortuaryPatient?.person?.person?.display;
          const gender = mortuaryPatient?.person?.person?.gender;
          const age = mortuaryPatient?.person?.person?.age;
          const causeOfDeath = mortuaryPatient?.person?.person?.causeOfDeath?.display;
          const dateOfDeath = mortuaryPatient?.person?.person?.deathDate;

          return (
            <BedCard
              key={patientUuid}
              patientName={patientName}
              gender={gender}
              age={age}
              causeOfDeath={causeOfDeath}
              dateOfDeath={dateOfDeath}
              patientUuid={patientUuid}
              onAdmit={() => handleAdmit(mortuaryPatient)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AwaitingBedLayout;
