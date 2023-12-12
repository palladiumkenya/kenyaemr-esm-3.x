import { defineConfigSchema } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@kenyaemr/esm-patient-clinical-view-app';

const options = {
  featureName: 'patient-clinical-view-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');
export const mchClinicalView = getAsyncLifecycle(
  () => import('./esm-mch-app/views/maternal-health/maternal-health.component'),
  options,
);
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
