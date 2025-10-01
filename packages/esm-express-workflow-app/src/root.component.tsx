import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useLeftNav } from '@openmrs/esm-framework';

import styles from './root.scss';
import DashboardContainer from './components/dashboard/dashboard-container.component';
import { spaBasePath } from './constants';
import FacilityDashboard from './components/facility-dashboard/facility-dashboard.component';

const Root: React.FC = () => {
  useLeftNav({ name: 'express-workflow-left-panel-slot', basePath: spaBasePath });

  return (
    <BrowserRouter basename={spaBasePath}>
      <main className={styles.container}>
        <Routes>
          <Route path="/" element={<DashboardContainer />} />
          <Route path="/:dashboard/*" element={<FacilityDashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default Root;
