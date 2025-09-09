import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { spaBasePath } from '../../constants';
import PatientChart from '../../shared/patient-chart/patient-chart.component';
import Triage from './triage.component';

type TriageDashboardProps = {
  dashboardTitle: string;
};

const TriageDashboard: React.FC<TriageDashboardProps> = ({ dashboardTitle }) => {
  return (
    <BrowserRouter basename={`${spaBasePath}/triage`}>
      <Routes>
        <Route path="/" element={<Triage dashboardTitle={dashboardTitle} />} />
        <Route path="/:patientUuid" element={<PatientChart navigationPath='triage'/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default TriageDashboard;
