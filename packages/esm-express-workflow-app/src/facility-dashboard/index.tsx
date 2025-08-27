import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../constants';
import FacilityDashboard from './facility-dashboard.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const facilityDashboard = getSyncLifecycle(FacilityDashboard, options);
export const facilityLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Dashboard',
    path: 'facility-dashboard',
    icon: 'omrs-icon-list-checked',
  }),
  options,
);
