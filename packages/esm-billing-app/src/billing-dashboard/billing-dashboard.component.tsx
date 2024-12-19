import React from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../billing-header/billing-header.component';
import BillingTabs from '../billing-tabs/billling-tabs.component';
import MetricsCards from '../metrics-cards/metrics-cards.component';
import styles from './billing-dashboard.scss';
import { ClockOutStrip } from './clock-out-strip.component';

export function BillingDashboard() {
  const { t } = useTranslation();

  return (
    <main className={styles.container}>
      <BillingHeader title={t('home', 'Home')} />
      <ClockOutStrip />
      <MetricsCards />
      <BillingTabs />
    </main>
  );
}
