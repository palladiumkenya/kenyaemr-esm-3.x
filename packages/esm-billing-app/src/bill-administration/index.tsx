import { getAsyncLifecycle } from '@openmrs/esm-framework';

const options = {
  featureName: 'billing-admin',
  moduleName: '@kenyaemr/esm-billing-app',
};

export const billingAdmin = getAsyncLifecycle(() => import('./home.component'), options);
