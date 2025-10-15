import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BillingDashboard from './billing-dashboard/billing-dashboard.component';
import ClaimsManagementOverview from './claims/claims-management/main/claims-overview-main.component';
import ClaimsManagementPreAuthRequest from './claims/claims-management/main/claims-pre-auth-main.component';
import ClaimScreen from './claims/dashboard/claims-dashboard.component';
import Invoice from './invoice/invoice.component';
import { ClockInBoundary } from './bill-administration/payment-points/clock-in-boundary.component';

const RootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/accounting';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<BillingDashboard />} />
        <Route path="/claims-overview" element={<ClaimsManagementOverview />} />
        <Route path="/preauth-requests" element={<ClaimsManagementPreAuthRequest />} />
        <Route
          path="/patient/:patientUuid/:billUuid"
          element={
            <ClockInBoundary>
              <Invoice />
            </ClockInBoundary>
          }
        />
        <Route
          path="/patient/:patientUuid/:billUuid/claims"
          element={
            <ClockInBoundary>
              <ClaimScreen />
            </ClockInBoundary>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
