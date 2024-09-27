import React from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedFilter from '../header/admitted-queue-header.component';
import styles from './admitted-queue.scss';
import CompartmentView from '../card/compartment-view.compartment';
import { useDeceasedPatient } from '../hook/useMorgue.resource';

export const AdmittedQueue: React.FC = () => {
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient('test');
  const { t } = useTranslation();

  if (isLoading) {
    return <p>{t('loading', 'Loading...')}</p>;
  }

  if (error) {
    return (
      <p>
        {t('error', 'An error occurred:')} {error.message}
      </p>
    );
  }

  return (
    <>
      <DeceasedFilter />
      <div className={styles.patientCardContainer}>
        <CompartmentView patients={deceasedPatients || []} />
      </div>
    </>
  );
};
