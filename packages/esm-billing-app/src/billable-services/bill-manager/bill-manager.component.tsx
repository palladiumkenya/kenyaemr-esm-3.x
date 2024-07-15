import React from 'react';
import { ExtensionSlot, UserHasAccess, WorkspaceContainer } from '@openmrs/esm-framework';
import PatientBills from './patient-bills.component';
import styles from './bill-manager.scss';
import billTableStyles from '../../bills-table/bills-table.scss';
import { useBills } from '../../billing.resource';
import { DataTableSkeleton, Layer, Tile } from '@carbon/react';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

type BillManagerProps = {};

const headers = [
  { header: 'Date', key: 'date' },
  { header: 'Billable Service', key: 'billableService' },
  { header: 'Total Amount', key: 'totalAmount' },
];

const BillManager: React.FC<BillManagerProps> = () => {
  const [patientUuid, setPatientUuid] = React.useState<string>(undefined);
  const { t } = useTranslation();

  const { bills, isLoading } = useBills(patientUuid);
  const filteredBills = bills.filter((bill) => bill.status !== 'PAID' && patientUuid === bill.patientUuid) ?? [];

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
        {!patientUuid && (
          <div style={{ marginTop: '0.625rem' }}>
            <Layer className={billTableStyles.emptyStateContainer}>
              <Tile className={billTableStyles.tile}>
                <div className={billTableStyles.illo}>
                  <EmptyDataIllustration />
                </div>
                <p className={billTableStyles.content}>
                  {t('notSearchedState', 'Please search for a patient in the input above')}
                </p>
              </Tile>
            </Layer>
          </div>
        )}
        {isLoading && (
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
        )}
        {bills.length > 0 && patientUuid && <PatientBills bills={filteredBills} />}
      </div>
      <WorkspaceContainer overlay contextKey="bill-manager" />
    </UserHasAccess>
  );
};

export default BillManager;
