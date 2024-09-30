import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { BillingDashboard } from './billing-dashboard/billing-dashboard.component';
import Invoice from './invoice/invoice.component';
import ClaimScreen from './claims/dashboard/claims-dashboard.component';
import PaymentHistoryViewer from './billable-services/payment-history/payment-history-viewer.component';
import { BillableServicesDashboard } from './billable-services/dashboard/dashboard.component';
import BillManager from './billable-services/bill-manager/bill-manager.component';

const RootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/billing';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<BillingDashboard />} />
        <Route path="/patient/:patientUuid/:billUuid" element={<Invoice />} />
        <Route path="/patient/:patientUuid/:billUuid/claims" element={<ClaimScreen />} />
        <Route path="/payment-history" element={<PaymentHistoryViewer />} />
        <Route path="/bill-manager" element={<BillManager />} />
        <Route path="/billable-services" element={<BillableServicesDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
