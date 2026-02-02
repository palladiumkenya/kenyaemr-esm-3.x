import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import ReportsDashboard from './dashboard.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const reportsDashboard = getSyncLifecycle(ReportsDashboard, options);
// t('reports', 'Reports')
export const reportsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'reports',
    title: 'reports',
  }),
  options,
);
