import { getAsyncLifecycle, defineConfigSchema, registerBreadcrumbs, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';

const moduleName = '@kenyaemr/esm-billing-app';
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
}
