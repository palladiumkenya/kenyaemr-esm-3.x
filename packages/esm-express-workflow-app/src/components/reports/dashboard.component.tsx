import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Triage from './reports.component';
import { spaBasePath } from '../../constants';

type ReportsDashboardProps = {
  dashboardTitle: string;
};

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ dashboardTitle }) => {
  return (
    <BrowserRouter basename={`${spaBasePath}/reports`}>
      <Routes>
        <Route path="/" element={<Triage dashboardTitle={dashboardTitle} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default ReportsDashboard;
