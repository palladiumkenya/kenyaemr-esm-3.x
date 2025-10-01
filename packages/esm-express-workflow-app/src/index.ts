import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import CheckinFormExtraExtension from './components/registration/checkin-form-extra/checkin-form-extra.extension';

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
export * from './components/consultation';
export * from './components/admissions';
export * from './components/lab';
export * from './components/mch';
export * from './components/pharmacy';
export * from './components/procedures';
export * from './components/radiology';
export * from './components/reports';

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const otpVerificationModal = getAsyncLifecycle(
  () => import('./shared/otp-verification/otp-verification.modal'),
  options,
);
export const checkinFormExtraExtension = getSyncLifecycle(CheckinFormExtraExtension, options);
