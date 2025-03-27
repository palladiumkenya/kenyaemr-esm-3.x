import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { setLeftNav, unsetLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';
import styles from './root.scss';
import LeftPanel from './components/side-menu/left-pannel.component';
import UserManagentLandingPage from './components/users/manage-users/manage-user.component';
import EtlAdminDashboard from './components/dashboard/etl-dashboard.component';
import FacilitySetup from './components/facility-setup/facility-setup.component';

const Root: React.FC = () => {
  const spaBasePath = window.spaBase;
  const adminBasename = window.getOpenmrsSpaBase() + 'admin';

  useEffect(() => {
    setLeftNav({
      name: 'admin-left-panel-slot',
      basePath: spaBasePath,
    });
    return () => unsetLeftNav('admin-left-panel-slot');
  }, [spaBasePath]);

  return (
    <BrowserRouter basename={adminBasename}>
      <LeftPanel />
      <main className={styles.container}>
        <Routes>
          <Route path="/" element={<UserManagentLandingPage />} />
          <Route path="/user-management" element={<UserManagentLandingPage />} />
          <Route path="/etl-administration" element={<EtlAdminDashboard />} />
          <Route path="/facility-setup" element={<FacilitySetup />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default Root;
