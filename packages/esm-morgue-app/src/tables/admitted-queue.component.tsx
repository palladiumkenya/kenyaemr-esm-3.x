import React from 'react';
import { useDeceasedPatient } from './generic-table.resource';
import { useTranslation } from 'react-i18next';
import DeceasedFilter from '../header/admitted-queue-header.component';
import styles from './admitted-queue.scss';
import WardPatientCard from '../card/unit-patient-card';

// Fixed TypeScript type for deceasedPatientName parameter
export const AdmittedQueue: React.FC = () => {
  // Fetch data using the hook
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient('test'); // Replace 'test' with the actual query name
  const { t } = useTranslation();

  // Handle loading state
  if (isLoading) {
    return <p>{t('loading', 'Loading...')}</p>;
  }

  // Handle error state
  if (error) {
    return (
      <p>
        {t('error', 'An error occurred:')} {error.message}
      </p>
    );
  }

  // Render list of patients
  return (
    <>
      <DeceasedFilter />
      <div className={styles.patientCardContainer}>
        {deceasedPatients?.map((patient) => (
          <WardPatientCard key={patient.uuid} patient={patient} />
        ))}
      </div>
    </>
  );
};
