import React, { useEffect } from 'react';
import { Routes, BrowserRouter, Route } from 'react-router-dom';
import { setLeftNav, unsetLeftNav } from '@openmrs/esm-framework';
import Dashboard from './components/dashboard/home-dashboard.component';

const CrossBorderApp = () => {
  const spaBasePath = `${window.spaBase}/cross-border`;

  useEffect(() => {
    setLeftNav({ name: 'cross-border-page-dashboard-slot', basePath: spaBasePath });
    return () => unsetLeftNav('cross-border-page-dashboard-slot');
  }, [spaBasePath]);

  return (
    <main>
      <BrowserRouter basename={window.spaBase}>
        <Routes>
          <Route path="/cross-border" element={<Dashboard />} />
          <Route path="/cross-border/:dashboard/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default CrossBorderApp;
