import { WorkspaceContainer } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../../billing-header/billing-header.component';
import ClinicalCharges from '../clinical-charges.component';
import styles from './dashboard.scss';

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
