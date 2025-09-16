import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

import PatientSummaryDashboard from './shared/patient-chart/patient-summary-dashboard/patient-summary-dashboard.component';

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
export * from './components/mch';
export * from './components/reports';
export * from './components/pharmacy';
export * from './components/laboratory';
export * from './components/radiology-and-imaging';
export * from './components/procedures';

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const otpVerificationModal = getAsyncLifecycle(
  () => import('./shared/otp-verification/otp-verification.modal'),
  options,
);
export const patientSummaryDashboard = getSyncLifecycle(PatientSummaryDashboard, options);
