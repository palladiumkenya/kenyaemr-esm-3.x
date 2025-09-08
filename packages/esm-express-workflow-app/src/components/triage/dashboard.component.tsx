import React from 'react';
import styles from './dashboard.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Triage from './triage.component';
import { spaBasePath } from '../../constants';
import PatientChart from '../../shared/patient-chart/patient-chart.component';

type TriageDashboardProps = {
  dashboardTitle: string;
};

const TriageDashboard: React.FC<TriageDashboardProps> = ({ dashboardTitle }) => {
  return (
    <BrowserRouter basename={`${spaBasePath}/triage`}>
      <Routes>
        <Route path="/" element={<Triage dashboardTitle={dashboardTitle} />} />
        <Route path="/:patientUuid" element={<PatientChart />} />
      </Routes>
    </BrowserRouter>
  );
};

export default TriageDashboard;
