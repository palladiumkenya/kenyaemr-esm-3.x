import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import Registration from './registration.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const registrationDashboard = getSyncLifecycle(Registration, options);
// t('registration', 'Registration')
export const registrationLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    title: 'registration',
    name: 'registration',
  }),
  options,
);
