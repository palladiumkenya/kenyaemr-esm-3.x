import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './dashboard.scss';
import ServiceMetrics from './service-metrics.component';
import BillableServices from '../billable-services.component';
import { WorkspaceContainer } from '@openmrs/esm-framework';

export const BillableServicesDashboard = () => {
  const { t } = useTranslation();

  return (
    <main className={styles.container}>
      <ServiceMetrics />
      <main className={styles.servicesTableContainer}>
        <BillableServices />
      </main>
      <WorkspaceContainer overlay contextKey="billable-services" />
    </main>
  );
};
