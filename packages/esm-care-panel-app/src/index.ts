import { getAsyncLifecycle, defineConfigSchema, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@kenyaemr/esm-care-panel-app';

const options = {
  featureName: 'patient-care-panels',
  moduleName,
};
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const patientProgramSummary = getAsyncLifecycle(() => import('./care-panel/care-panel.component'), options);

export const patientSummary = getAsyncLifecycle(() => import('./patient-summary/patient-summary.component'), options);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
}
