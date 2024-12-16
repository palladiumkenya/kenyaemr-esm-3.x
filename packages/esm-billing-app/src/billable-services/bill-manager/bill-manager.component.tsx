import React from 'react';
import { ExtensionSlot, UserHasAccess, WorkspaceContainer } from '@openmrs/esm-framework';
import PatientBills from './patient-bills.component';
import styles from './bill-manager.scss';
import billTableStyles from '../../bills-table/bills-table.scss';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../../billing-header/billing-header.component';
import { usePatientBills } from '../../prompt-payment/prompt-payment.resource';

type BillManagerProps = {};

const headers = [
  { header: 'Date', key: 'date' },
  { header: 'Billable Service', key: 'billableService' },
  { header: 'Total Amount', key: 'totalAmount' },
];

const BillManager: React.FC<BillManagerProps> = () => {
  const [patientUuid, setPatientUuid] = React.useState<string>(undefined);
  const { t } = useTranslation();
  const { patientBills: bills, isLoading } = usePatientBills(patientUuid);
  const filteredBills = bills.filter((bill) => patientUuid === bill.patientUuid) ?? [];

  return (
    <>
      <BillingHeader title={t('billManager', 'Bill Manager')} />
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
        {!patientUuid ? (
          <div className={billTableStyles.emptyStateContainer}>
            <EmptyState
              displayText={t('notSearchedState', 'Please search for a patient in the input above')}
              headerTitle="Not Searched"
            />
          </div>
        ) : isLoading ? (
          <DataTableSkeleton
            headers={headers}
            aria-label="patient bills table"
            showToolbar={false}
            showHeader={false}
            rowCount={3}
            zebra
            columnCount={3}
            className={styles.dataTableSkeleton}
          />
        ) : (
          bills && <PatientBills bills={filteredBills} />
        )}
      </div>
      <WorkspaceContainer overlay contextKey="bill-manager" />
    </>
  );
};

export default BillManager;
