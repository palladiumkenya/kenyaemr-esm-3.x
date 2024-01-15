import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BillableServicesDashboard } from './dashboard/dashboard.component';
import AddBillableService from './create-edit/add-billable-service.component';

const BillableServiceHome: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/billable-services`}>
      <Routes>
        <Route path="/" element={<BillableServicesDashboard />} />
        <Route path="/add-service" element={<AddBillableService />} />
      </Routes>
    </BrowserRouter>
  );
};

export default BillableServiceHome;
