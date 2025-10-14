import { getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import {
  billableExemptionsDashboardMeta,
  billDepositDashboardMeta,
  clinicalChargesDashboardMeta,
  paymentHistoryDashboardMeta,
  paymentModeDashboardMeta,
} from './dashboard.meta';

const options = {
  featureName: 'billing-admin',
  moduleName: '@kenyaemr/esm-billing-app',
};

// Bill Deposit Components
export const billDepositSearch = getAsyncLifecycle(
  () => import('./bill-deposit/components/search/bill-deposit-search.component'),
  options,
);
export const addDepositWorkspace = getAsyncLifecycle(
  () => import('./bill-deposit/components/forms/add-deposit.workspace'),
  options,
);
export const deleteDepositModal = getAsyncLifecycle(
  () => import('./bill-deposit/components/modal/delete-deposit.modal'),
  options,
);
export const depositTransactionWorkspace = getAsyncLifecycle(
  () => import('./bill-deposit/components/forms/deposit-transactions/deposit-transaction.workspace'),
  options,
);
export const reverseTransactionModal = getAsyncLifecycle(
  () => import('./bill-deposit/components/modal/reverse-transaction.modal'),
  options,
);

export const billDepositDashboard = getAsyncLifecycle(
  () => import('./bill-deposit/components/dashboard/bill-deposit-dashboard.component'),
  options,
);
export const billableExemptions = getAsyncLifecycle(
  () => import('./billable-exemption/billable-exemptions.component'),
  options,
);

export const paymentModeDashboard = getAsyncLifecycle(
  () => import('./payment-modes/payment-mode-dashboard.component'),
  options,
);

export const clinicalCharges = getAsyncLifecycle(() => import('./service-catalog/clinical-charges.component'), options);
export const paymentHistoryDashboard = getAsyncLifecycle(
  () => import('./payment-history/payment-dashboard.component'),
  options,
);
export const billingAdmin = getAsyncLifecycle(() => import('./home.component'), options);

export const billDepositDashboardLink = getSyncLifecycle(createDashboardLink(billDepositDashboardMeta), options);
export const billableExemptionsLink = getSyncLifecycle(createDashboardLink(billableExemptionsDashboardMeta), options);
export const paymentModeLink = getSyncLifecycle(createDashboardLink(paymentModeDashboardMeta), options);
export const clinicalChargesLink = getSyncLifecycle(createDashboardLink(clinicalChargesDashboardMeta), options);
export const paymentHistoryLink = getSyncLifecycle(createDashboardLink(paymentHistoryDashboardMeta), options);
