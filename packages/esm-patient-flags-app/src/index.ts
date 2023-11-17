import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';

const moduleName = '@kenyaemr/esm-patient-flags-app';

const options = {
  featureName: 'patient-flags',
  moduleName,
};
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const patientFlag = getAsyncLifecycle(() => import('./patient-flags/patient-flags.component'), options);

export const kenyaemrHomeLink = getAsyncLifecycle(() => import('./kenyaemr-link/kenyaemr-link.component'), options);
export const clearCacheButton = getAsyncLifecycle(() => import('./clear-cache/clear-cache.component'), options);

export const kenyaemr2ChartLink = getAsyncLifecycle(
  () => import('./kenyaemr-link/kenyaemr-chart-link.component'),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
