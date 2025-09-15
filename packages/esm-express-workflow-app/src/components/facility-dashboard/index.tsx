import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import FacilityDashboard from './facility-dashboard.component';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import DashboardAuthorizationForm from './dashboard-authorization-form.modal';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const facilityDashboard = getSyncLifecycle(FacilityDashboard, options);
export const facilityLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    title: 'Dashboard',
    name: 'facility-dashboard',
  }),
  options,
);

export const facilityDashboardAuthorizationModal = getSyncLifecycle(DashboardAuthorizationForm, options);
