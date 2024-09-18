import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './dashboard.scss';
import { WorkspaceContainer } from '@openmrs/esm-framework';
import ClinicalCharges from '../clinical-charges.component';
import BillingHeader from '../../billing-header/billing-header.component';

export const BillableServicesDashboard = () => {
  const { t } = useTranslation();

  return (
    <main className={styles.container}>
      <BillingHeader title={t('billableServices', 'Billable Services')} />
      <main className={styles.servicesTableContainer}>
        <ClinicalCharges />
      </main>
      <WorkspaceContainer overlay contextKey="billable-services" />
    </main>
  );
};
