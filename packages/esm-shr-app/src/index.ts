import { getAsyncLifecycle, defineConfigSchema, registerBreadcrumbs, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const moduleName = '@kenyaemr/esm-shr-app';

const options = {
  featureName: 'patient-shr',
  moduleName,
};
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const shrPatientSummary = getAsyncLifecycle(
  () => import('./shrpatient-summary/shrpatient-summary.component'),
  options,
);
// t('sharedhealthrecords', 'Shared Health Records')
export const shrSummaryDashboardLink = getSyncLifecycle(createDashboardLink({ ...dashboardMeta, moduleName }), options);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
}
