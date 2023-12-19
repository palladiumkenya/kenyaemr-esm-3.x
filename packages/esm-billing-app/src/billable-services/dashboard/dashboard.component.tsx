import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './dashboard.scss';
import BillingHeader from '../../billing-header/billing-header.component';
import ServiceMetrics from './service-metrics.component';

export function BillableServicesDashboard() {
  const { t } = useTranslation();

  return (
    <main className={styles.container}>
      <BillingHeader title={t('billableServicesManagement', 'Billable Services Management')} />
      <ServiceMetrics />
    </main>
  );
}
