import React, { useState } from 'react';
import styles from './patient-bills-dashboard.scss';
import { ErrorState, ExtensionSlot } from '@openmrs/esm-framework';
import { useBills } from '../../billing.resource';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { patientBillsHeaders, PatientBills } from '../patient-bills.component';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

const PatientBillsScreen: React.FC = () => {
  const [patientUuid, setPatientUuid] = useState<string | undefined>();

  return (
    <main className={styles.container}>
      <ExtensionSlot
        name="patient-search-bar-slot"
        state={{
          selectPatientAction: (patientUuid: string) => setPatientUuid(patientUuid),
          buttonProps: {
            kind: 'primary',
          },
        }}
      />
      <PatientBillsWrapper patientUUID={patientUuid} />
    </main>
  );
};

const PatientBillsWrapper = ({ patientUUID }: { patientUUID?: string }) => {
  const { bills, isLoading, error } = useBills(patientUUID);

  const { t } = useTranslation();

  if (!patientUUID) {
    return (
      <div className={styles.emptyStateContainer}>
        <EmptyState
          displayText={t('notSearchedState', 'Please search for a patient in the input above')}
          headerTitle="Not Searched"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton
          headers={patientBillsHeaders}
          aria-label="patient bills table"
          showToolbar={false}
          showHeader={false}
          rowCount={3}
          zebra
          columnCount={3}
          className={styles.dataTableSkeleton}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorStateContainer}>
        <ErrorState
          error={t('anErrorOccurredLoadingPatientBills', 'An error occurred loading patient bills')}
          headerTitle={t('errorLoadingPatientBills', 'Error loading patient bills')}
        />
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className={styles.emptyStateContainer}>
        <EmptyState
          headerTitle={t('noBillsState', 'No Patient Bills Found')}
          displayText={t('noBillsFoundToDisplay', 'No bills to dipsplay')}
        />
      </div>
    );
  }

  return <PatientBills bills={bills} />;
};

export default PatientBillsScreen;
