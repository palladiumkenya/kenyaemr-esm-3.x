import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BillableServicesDashboard } from './dashboard/dashboard.component';

const BillableServiceHome: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/billable-services`}>
      <Routes>
        <Route path="/" element={<BillableServicesDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default BillableServiceHome;
