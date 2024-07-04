import React, { useState } from 'react';
import styles from './patient-bills-dashboard.scss';
import { ExtensionSlot } from '@openmrs/esm-framework';
import PastPatientBills from '../filtered-patient-bills.component';
import { useBills } from '../../billing.resource';
import { Dropdown } from '@carbon/react';

const filterItems = [
  { id: 'PENDING', text: 'Pending bills' },
  { id: 'POSTED', text: 'Posted bills' },
];

const PatientBillsScreen: React.FC = () => {
  const [patientUuid, setPatientUuid] = React.useState<string>('');
  const { bills } = useBills(patientUuid);
  const filterBills = bills.filter((bill) => bill.status !== 'PAID' && patientUuid === bill.patientUuid) ?? [];

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
      <PastPatientBills patientUuid={patientUuid} bills={filterBills} setPatientUuid={setPatientUuid} />
    </main>
  );
};

export default PatientBillsScreen;
