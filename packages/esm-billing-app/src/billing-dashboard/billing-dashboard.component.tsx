import React from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../billing-header/billing-header.component';
import MetricsCards from '../metrics-cards/metrics-cards.component';
import styles from './billing-dashboard.scss';
import BillsTable from '../bills-table/bills-table.component';

export function BillingDashboard() {
  const { t } = useTranslation();

  return (
    <>
      <BillingHeader title={t('home', 'Home')} />
      <MetricsCards />
      <main className={styles.container}>
        <BillsTable />
      </main>
    </>
  );
}
