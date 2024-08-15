import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { BillingDashboard } from './billing-dashboard/billing-dashboard.component';
import Invoice from './invoice/invoice.component';
import ClaimScreen from './claims/dashboard/claims-dashboard.component';
import ClaimsManagementOverview from './claims/claims-management/main/claims-overview-main.component';

const RootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/billing';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<BillingDashboard />} />
        <Route path="/patient/:patientUuid/:billUuid" element={<Invoice />} />
        <Route path="/patient/:patientUuid/:billUuid/claims" element={<ClaimScreen />} />
        <Route path="/claims-overview" element={<ClaimsManagementOverview />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
