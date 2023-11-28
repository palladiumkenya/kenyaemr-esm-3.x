import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import VisitBillingInfo from './visit-billing-info/visit-billing-info.component';

import rootComponent from './root.component';
import { createLeftPanelLink } from './left-panel-link.component';

const moduleName = '@kenyaemr/esm-billing-app';
const options = {
  featureName: 'billing-app',
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

export const root = getSyncLifecycle(rootComponent, options);

export const visitBillingInfo = getSyncLifecycle(VisitBillingInfo, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
