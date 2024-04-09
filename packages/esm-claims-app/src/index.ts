import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { createLeftPanelLink } from './left-panel-link.component';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import rootComponent from './root.component';
import BillHistory from './bill-history/bill-history.component';
import BillingCheckInForm from './billing-form/billing-checkin-form.component';
import BillableServicesCardLink from './billable-services-admin-card-link.component';
import BillableServiceHome from './billable-services/billable-services-home.component';
import BillingForm from './billing-form/billing-form.component';
import VisitAttributeTags from './invoice/payments/visit-tags/visit-attribute.component';
import InitiatePaymentDialog from './invoice/payments/initiate-payment/initiate-payment.component';
import BillingPrompt from './billing-prompt/billing-prompt.component';

const moduleName = '@kenyaemr/esm-claims-app';

const options = {
  featureName: 'claims',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

// export const claimsSummaryDashboardLink = getSyncLifecycle(
//   createDashboardLink({ ...dashboardMeta, moduleName }),
//   options,
// );

export const claimsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'claims',
    title: 'Claims',
  }),
  options,
);

export const root = getSyncLifecycle(rootComponent, options);
export const claimsPatientSummary = getSyncLifecycle(BillHistory, options);
export const claimsCheckInForm = getSyncLifecycle(BillingCheckInForm, options);
export const claimsServicesHome = getSyncLifecycle(BillableServiceHome, options);
export const claimsServicesCardLink = getSyncLifecycle(BillableServicesCardLink, options);
export const claimsForm = getSyncLifecycle(BillingForm, options);
export const visitAttributeTags = getSyncLifecycle(VisitAttributeTags, options);
export const initiatePaymentDialog = getSyncLifecycle(InitiatePaymentDialog, options);
export const claimsPrompt = getSyncLifecycle(BillingPrompt, options);
