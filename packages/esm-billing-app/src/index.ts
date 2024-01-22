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
import RequirePaymentModal from './modal/require-payment-modal.component';
import VisitAttributeTags from './invoice/payments/visit-tags/visit-attribute.component';

const moduleName = '@kenyaemr/esm-billing-app';

const options = {
  featureName: 'billing',
  moduleName,
};

// t('billing', 'Billing')
export const billingDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'billing',
    title: 'Billing',
  }),
  options,
);

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const billingSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);

export const root = getSyncLifecycle(rootComponent, options);
export const billingPatientSummary = getSyncLifecycle(BillHistory, options);
export const billingCheckInForm = getSyncLifecycle(BillingCheckInForm, options);
export const billableServicesHome = getSyncLifecycle(BillableServiceHome, options);
export const billableServicesCardLink = getSyncLifecycle(BillableServicesCardLink, options);
export const billingForm = getSyncLifecycle(BillingForm, options);
export const requirePaymentModal = getSyncLifecycle(RequirePaymentModal, options);
export const visitAttributeTags = getSyncLifecycle(VisitAttributeTags, options);
