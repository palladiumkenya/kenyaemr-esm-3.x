import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BillableServices from './billable-services.component';

const BillableServiceHome: React.FC = () => {
  return (
    <BrowserRouter basename={`${window.spaBase}/billable-services`}>
      <Routes>
        <Route path="/" element={<BillableServices />} />
      </Routes>
    </BrowserRouter>
  );
};

export default BillableServiceHome;
