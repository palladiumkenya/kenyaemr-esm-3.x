import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { setLeftNav, unsetLeftNav } from '@openmrs/esm-framework';
import { etlBasePath } from './constants';
import Dashboard from './components/dashboard/home-dashboard.component';

const Root: React.FC = () => {
  const spaBasePath = `${window.spaBase}/admin`;

  useEffect(() => {
    setLeftNav({ name: 'admin-page-dashboard-slot', basePath: spaBasePath });
    return () => unsetLeftNav('admin-page-dashboard-slot');
  }, [spaBasePath]);
  return (
    <main className="omrs-main-content">
      <BrowserRouter basename={etlBasePath}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/:user-management" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default Root;
