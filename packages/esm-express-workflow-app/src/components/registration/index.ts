import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import Registration from './registration.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const registrationDashboard = getSyncLifecycle(Registration, options);
export const registrationLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Registration',
    path: 'registration',
    icon: 'omrs-icon-user-avatar',
  }),
  options,
);
