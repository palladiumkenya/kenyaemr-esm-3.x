import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { BillingDashboard } from './billing-dashboard/billing-dashboard.component';
import Invoice from './invoice/invoice.component';
import ClaimScreen from './claims/dashboard/claims-dashboard.component';
import PreAuthRequestDashboard from './claims/pre-auth/pre-auth-dashboard.component';

const RootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/billing';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<BillingDashboard />} />
        <Route path="/patient/:patientUuid/:billUuid" element={<Invoice />} />
        <Route path="/patient/:patientUuid/:billUuid/claims" element={<ClaimScreen />} />
        <Route path="/patient/:patientUuid/:billUuid/pre-auth-request" element={<PreAuthRequestDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
