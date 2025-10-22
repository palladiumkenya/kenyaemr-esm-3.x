import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';

import DashboardContainer from '../dashboard/dashboard-container.component';

import styles from './dashboard.scss';

const AppointmentsDashboard: React.FC = () => {
  const dashboardExtensionSlot = 'appointments-left-panel-slot';
  useLeftNav({ name: dashboardExtensionSlot, basePath: `${window.spaBase}`, mode: 'collapsed' });

  return (
    <BrowserRouter basename={`${window.spaBase}`}>
      <main className={styles.container}>
        <Routes>
          <Route path="/" element={<DashboardContainer dashboardExtensionSlot={dashboardExtensionSlot} />} />
          <Route
            path="/:dashboard/*"
            element={<DashboardContainer dashboardExtensionSlot={dashboardExtensionSlot} />}
          />
        </Routes>
      </main>
      <WorkspaceContainer key="appointments" contextKey="appointments" />
    </BrowserRouter>
  );
};

export default AppointmentsDashboard;
