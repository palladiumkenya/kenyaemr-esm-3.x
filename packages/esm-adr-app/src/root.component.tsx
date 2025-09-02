import React, { useEffect } from 'react';
import { Routes, BrowserRouter, Route } from 'react-router-dom';
import { setLeftNav, unsetLeftNav } from '@openmrs/esm-framework';
import Dashboard from './components/dashboard/home-dashboard.component';
import AdrPatientSummary from './components/adr-patient-summary/patient-summary.component';

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
          <Route path="/adr-assessment/:dashboard/:patientUuid" element={<AdrPatientSummary />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default AdrAssessmentApp;
