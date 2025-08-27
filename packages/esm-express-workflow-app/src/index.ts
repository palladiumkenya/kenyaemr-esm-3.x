import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@kenyaemr/esm-express-workflow-app';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
export * from './facility-dashboard';
export * from './registration';
export * from './triage';
export * from './accounting';
export * from './consulation';
export * from './admissions';
export * from './lab';
export * from './mch';
export * from './pharmacy';
export * from './procedures';
export * from './radiology';
export * from './reports';

export const root = getAsyncLifecycle(() => import('./root.component'), options);
