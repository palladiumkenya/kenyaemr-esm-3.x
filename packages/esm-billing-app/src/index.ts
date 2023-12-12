import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { createLeftPanelLink } from './left-panel-link.component';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import billHistoryComponent from './bill-history/bill-history.component';
import rootComponent from './root.component';

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

export const billingPatientSummary = getSyncLifecycle(billHistoryComponent, options);

export const root = getSyncLifecycle(rootComponent, options);
