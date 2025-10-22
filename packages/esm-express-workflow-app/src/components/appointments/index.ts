import { getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName: '@kenyaemr/esm-express-workflow-app',
};

export const appointmentsDashboard = getAsyncLifecycle(() => import('./dashboard.component'), options);
export const appointmentsDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: `appointments`,
    title: 'Appointments',
    icon: 'omrs-icon-calendar',
  }),
  options,
);
