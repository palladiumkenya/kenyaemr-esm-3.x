import React from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../billing-header/billing-header.component';
import MetricsCards from '../metrics-cards/metrics-cards.component';
import styles from './billing-dashboard.scss';
import BillingTabs from '../billing-tabs/billling-tabs.component';

export function BillingDashboard() {
  const { t } = useTranslation();

  return (
    <main className={styles.container}>
      <BillingHeader title={t('home', 'Home')} />
      <MetricsCards />
      <BillingTabs />
    </main>
  );
}
