import React from 'react';
import { useLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { billingAdminBasePath } from '../constants';
import DashboardContainer from './dashboard/dashboard-container.component';

import styles from './home.scss';

const BillingAdminHome: React.FC = () => {
  useLeftNav({ name: 'billing-admin-dashboard-slot', basePath: billingAdminBasePath });

  return (
    <BrowserRouter basename={billingAdminBasePath}>
      <main className={styles.container}>
        <Routes>
          <Route path="/" element={<DashboardContainer />} />
          <Route path="/:dashboard/*" element={<DashboardContainer />} />
        </Routes>
      </main>
      <WorkspaceContainer key="billing-admin" contextKey="billing-admin" />
    </BrowserRouter>
  );
};

export default BillingAdminHome;
