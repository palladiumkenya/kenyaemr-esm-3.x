import { getAsyncLifecycle, defineConfigSchema, registerBreadcrumbs, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';

import rootComponent from './root.component';

const moduleName = '@kenyaemr/esm-billing-app';

const options = {
  featureName: 'billing',
  moduleName,
};

// t('billing', 'Billing')
export const billingDashboardLink = getSyncLifecycle(createDashboardLink({ ...dashboardMeta, moduleName }), options);

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const root = getSyncLifecycle(rootComponent, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
