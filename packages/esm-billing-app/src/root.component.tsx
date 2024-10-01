import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BillManager from './billable-services/bill-manager/bill-manager.component';
import { BillableServicesDashboard } from './billable-services/dashboard/dashboard.component';
import { PaymentHistory } from './billable-services/payment-history/payment-history.component';
import { BillingDashboard } from './billing-dashboard/billing-dashboard.component';
import ClaimScreen from './claims/dashboard/claims-dashboard.component';
import Invoice from './invoice/invoice.component';
import { ClockInBoundary } from './payment-points/clock-in-boundary.component';
import { PaymentPoint } from './payment-points/payment-point/payment-point.component';
import { PaymentPoints } from './payment-points/payment-points.component';

const RootComponent: React.FC = () => {
  const baseName = window.getOpenmrsSpaBase() + 'home/billing';

  return (
    <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/" element={<BillingDashboard />} />
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
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-points" element={<PaymentPoints />} />
        <Route path="/payment-points/:paymentPointUUID" element={<PaymentPoint />} />
        <Route path="/bill-manager" element={<BillManager />} />
        <Route path="/billable-services" element={<BillableServicesDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RootComponent;
