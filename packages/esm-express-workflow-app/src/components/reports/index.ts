import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import ReportsDashboard from './dashboard.component';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const reportsDashboard = getSyncLifecycle(ReportsDashboard, options);
// t('Reports', 'Reports')
export const reportsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'reports',
    title: 'Reports',
  }),
  options,
);
