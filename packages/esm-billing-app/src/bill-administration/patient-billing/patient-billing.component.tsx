import React from 'react';
import { ExtensionSlot, UserHasAccess, WorkspaceContainer } from '@openmrs/esm-framework';
import PatientBills from './patient-bills.component';
import styles from './patient-billing.scss';
import billTableStyles from '../../bills-table/bills-table.scss';
import { DataTableSkeleton } from '@carbon/react';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../../billing-header/billing-header.component';
import { usePatientBills } from '../../prompt-payment/prompt-payment.resource';
import EmptyPatientBill from '../../past-patient-bills/patient-bills-dashboard/empty-patient-bill.component';

type PatientBillingProps = {};

const headers = [
  { header: 'Date', key: 'date' },
  { header: 'Billable Service', key: 'billableService' },
  { header: 'Total Amount', key: 'totalAmount' },
];

const PatientBilling: React.FC<PatientBillingProps> = () => {
  const [patientUuid, setPatientUuid] = React.useState<string>(undefined);
  const { t } = useTranslation();
  const { patientBills: bills, isLoading } = usePatientBills(patientUuid);
  const filteredBills = bills.filter((bill) => patientUuid === bill.patientUuid) ?? [];

  return (
    <>
      <BillingHeader title={t('patientBilling', 'Patient Billing')} />
      <div className={styles.patientBillingContainer}>
        <ExtensionSlot
          name="patient-search-bar-slot"
          state={{
            selectPatientAction: (patientUuid: string) => setPatientUuid(patientUuid),
            buttonProps: {
              kind: 'secondary',
            },
          }}
        />
        {!patientUuid ? (
          <div className={billTableStyles.emptyStateContainer}>
            <EmptyPatientBill />
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
      <WorkspaceContainer overlay contextKey="patient-billing" />
    </>
  );
};

export default PatientBilling;
