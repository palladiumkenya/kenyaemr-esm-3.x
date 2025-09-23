import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import BillingHeader from '../billing-header/billing-header.component';
import BillingTabs from '../billing-tabs/billling-tabs.component';
import MetricsCards from '../metrics-cards/metrics-cards.component';
import RootComponent from '../root.component'; // Import your router
import styles from './billing-dashboard.scss';
import { ClockOutStrip } from './clock-out-strip.component';
import { UserHasAccess } from '@openmrs/esm-framework';

function BillingDashboard() {
  const { t } = useTranslation();

  const currentPath = window.location.pathname;
  const isMainDashboard = currentPath.endsWith('/accounting') || currentPath.endsWith('/accounting/');

  if (isMainDashboard) {
    return (
      <main className={styles.container}>
        <BillingHeader title={t('home', 'Home')} />
        <ClockOutStrip />
        <UserHasAccess privilege="o3: View Billing Metrics">
          <MetricsCards />
        </UserHasAccess>
        <BillingTabs />
      </main>
    );
  }

  return <RootComponent />;
}

export default BillingDashboard;
