import React, { useState } from 'react';
import styles from './patient-bills-dashboard.scss';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { PatientBills } from '../patient-bills.component';
import { usePatientBills } from '../../prompt-payment/prompt-payment.resource';
import PatientSearchExtension from './patient-search-extension.component';
import EmptyPatientBill from './empty-patient-bill.component';

const PatientBillsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [patientUuid, setPatientUuid] = useState<string | undefined>();
  const { patientBills: bills, isLoading, error } = usePatientBills(patientUuid);

  if (error) {
    return (
      <div className={`${styles.emptyStateContainer} ${styles.container}`}>
        <PatientSearchExtension setPatientUuid={setPatientUuid} />
        <ErrorState
          error={t('anErrorOccurredLoadingPatientBills', 'An error occurred loading patient bills')}
          headerTitle={t('errorLoadingPatientBills', 'Error loading patient bills')}
        />
      </div>
    );
  }

  if (!patientUuid) {
    return (
      <>
        <PatientSearchExtension setPatientUuid={setPatientUuid} />
        <EmptyPatientBill />
      </>
    );
  }

  return (
    <main className={styles.container}>
      <PatientSearchExtension setPatientUuid={setPatientUuid} />
      <PatientBills patientUuid={patientUuid} bills={bills} onCancel={setPatientUuid} />
    </main>
  );
};

export default PatientBillsScreen;
