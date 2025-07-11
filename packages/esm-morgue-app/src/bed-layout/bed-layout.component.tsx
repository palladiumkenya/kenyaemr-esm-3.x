import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import styles from './bed-layout.scss';
import BedCard from '../bed/bed.component';
import { MortuaryPatient } from '../typess';

interface BedLayoutProps {
  awaitingQueueDeceasedPatients: MortuaryPatient[];
  isLoading: boolean;
}

const BedLayout: React.FC<BedLayoutProps> = ({ awaitingQueueDeceasedPatients, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  if (awaitingQueueDeceasedPatients.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>{t('noDeceasedPatients', 'No deceased patients awaiting admission')}</p>
      </div>
    );
  }

  return (
    <div className={styles.bedLayoutWrapper}>
      <div className={styles.bedLayoutContainer}>
        {awaitingQueueDeceasedPatients.map((mortuaryPatient, index) => {
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
              onAdmit={() => {}}
              onCancel={() => {}}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BedLayout;
