import { setLeftNav, unsetLeftNav } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LeftPanel from './components/side-menu/left-pannel.component';
import styles from './root.scss';

const Root: React.FC = () => {
  const spaBasePath = window.spaBase;
  const facilityDashboardBaseName = window.getOpenmrsSpaBase() + 'facility-dashboard';

  useEffect(() => {
    setLeftNav({
      name: 'facility-dashboard-left-panel-slot',
      basePath: spaBasePath,
    });
    return () => unsetLeftNav('facility-dashboard-left-panel-slot');
  }, [spaBasePath]);

  return (
    <BrowserRouter basename={facilityDashboardBaseName}>
      <LeftPanel />
      <main className={styles.container}>
        <Routes>
          <Route path="/" element={<div>landing...</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default Root;
