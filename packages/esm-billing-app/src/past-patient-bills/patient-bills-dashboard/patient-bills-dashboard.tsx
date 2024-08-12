import React, { useState } from 'react';
import styles from './patient-bills-dashboard.scss';
import { ErrorState, ExtensionSlot } from '@openmrs/esm-framework';
import { useBills } from '../../billing.resource';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { NoPatientSelectedState } from '../../billable-services/bill-manager/no-patient-selected-state.component';
import { patientBillsHeaders, PatientBills } from '../patient-bills.component';

const PatientBillsScreen: React.FC = () => {
  const [patientUuid, setPatientUuid] = useState<string | undefined>();
  const { bills, isLoading, error } = useBills(patientUuid);

  const { t } = useTranslation();

  return (
    <main className={styles.container}>
      <ExtensionSlot
        name="patient-search-bar-slot"
        state={{
          selectPatientAction: (patientUuid) => setPatientUuid(patientUuid),
          buttonProps: {
            kind: 'primary',
          },
        }}
      />
      {!patientUuid ? (
        <NoPatientSelectedState />
      ) : isLoading ? (
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
      ) : error ? (
        <ErrorState
          error={t('anErrorOccurredLoadingPatientBills', 'An error occurred loading patient bills')}
          headerTitle={t('errorLoadingPatientBills', 'Error loading patient bills')}
        />
      ) : (
        <PatientBills bills={bills} />
      )}
    </main>
  );
};

export default PatientBillsScreen;
