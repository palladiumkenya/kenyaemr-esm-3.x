import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import Registration from './registration.component';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const registrationDashboard = getSyncLifecycle(Registration, options);
export const registrationLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    title: 'Registration',
    name: 'registration',
  }),
  options,
);
