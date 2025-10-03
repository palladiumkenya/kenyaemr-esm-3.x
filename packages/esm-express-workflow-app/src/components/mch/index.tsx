import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import MCHDashboard from './dashboard.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const mchDashboard = getSyncLifecycle(MCHDashboard, options);
export const mchLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    title: 'MCH',
    name: 'mch',
  }),
  options,
);
