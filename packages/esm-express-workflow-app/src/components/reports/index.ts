import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import Reports from './reports.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const reportsDashboard = getSyncLifecycle(Reports, options);
export const reportsLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Reports',
    path: 'reports',
    icon: 'omrs-icon-document',
  }),
  options,
);
