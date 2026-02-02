import { getSyncLifecycle } from '@openmrs/esm-framework';

import FacilityDashboard from './facility-dashboard.component';
import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const facilityDashboard = getSyncLifecycle(FacilityDashboard, options);

// t('dashboard', 'Dashboard')
export const facilityLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    title: 'dashboard',
    name: 'facility-dashboard',
  }),
  options,
);
