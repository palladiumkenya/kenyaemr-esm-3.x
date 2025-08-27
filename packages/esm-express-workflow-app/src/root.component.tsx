import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useLeftNav } from '@openmrs/esm-framework';
import styles from './root.scss';
import DashboardContainer from './dashboard/dashboard-container.component';

const Root: React.FC = () => {
  const spaBasePath = `${window.spaBase}/express-workflow`;
  useLeftNav({ name: 'express-workflow-left-panel-slot', basePath: spaBasePath });

  return (
    <BrowserRouter basename={spaBasePath}>
      <main className={styles.container}>
        <Routes>
          <Route path="/:dashboard/*" element={<DashboardContainer />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default Root;
