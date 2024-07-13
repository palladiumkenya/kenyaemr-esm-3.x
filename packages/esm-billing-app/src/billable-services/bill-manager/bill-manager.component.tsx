import React from 'react';
import { ExtensionSlot, UserHasAccess } from '@openmrs/esm-framework';
import PatientBills from './patient-bills.component';
import styles from './bill-manager.scss';
import { useBills } from '../../billing.resource';

type BillManagerProps = {};

const BillManager: React.FC<BillManagerProps> = () => {
  const [patientUuid, setPatientUuid] = React.useState<string>('');
  const { bills } = useBills(patientUuid);
  const filterBills = bills.filter((bill) => bill.status !== 'PAID' && patientUuid === bill.patientUuid) ?? [];
  return (
    <UserHasAccess privilege="coreapps.systemAdministration">
      <div className={styles.billManagerContainer}>
        <ExtensionSlot
          name="patient-search-bar-slot"
          state={{
            selectPatientAction: (patientUuid: string) => setPatientUuid(patientUuid),
            buttonProps: {
              kind: 'primary',
            },
          }}
        />
        <PatientBills patientUuid={patientUuid} bills={filterBills} />
      </div>
    </UserHasAccess>
  );
};

export default BillManager;
