import React, { useEffect } from 'react';
import { Routes, BrowserRouter, Route } from 'react-router-dom';
import { setLeftNav, unsetLeftNav, WorkspaceContainer } from '@openmrs/esm-framework';
import Dashboard from './components/dashboard/home-dashboard.component';

const AdrAssessmentApp = () => {
  const spaBasePath = `${window.spaBase}/adr-assessment`;

  useEffect(() => {
    setLeftNav({ name: 'adr-assessment-page-dashboard-slot', basePath: spaBasePath });
    return () => unsetLeftNav('adr-assessment-page-dashboard-slot');
  }, [spaBasePath]);

  return (
    <main>
      <BrowserRouter basename={window.spaBase}>
        <Routes>
          <Route path="/adr-assessment" element={<Dashboard />} />
          <Route path="/adr-assessment/:dashboard/*" element={<Dashboard />} />
        </Routes>
        <WorkspaceContainer key="adr-assessment" contextKey="adr-assessment"></WorkspaceContainer>
      </BrowserRouter>
    </main>
  );
};

export default AdrAssessmentApp;
