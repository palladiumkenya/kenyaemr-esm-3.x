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
export * from './components/facility-dashboard';
export * from './components/registration';
export * from './components/triage';
export * from './components/accounting';
export * from './components/consulation';
export * from './components/admissions';
export * from './components/lab';
export * from './components/mch';
export * from './components/pharmacy';
export * from './components/procedures';
export * from './components/radiology';
export * from './components/reports';

export * from './shared/express-workflow-workspace';

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const otpVerificationModal = getAsyncLifecycle(() => import('./shared-components/otp-verification'), options);
