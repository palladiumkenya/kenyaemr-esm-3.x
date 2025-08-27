import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../constants';
import Accounting from './accounting.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const accountingDashboard = getSyncLifecycle(Accounting, options);
export const accountingLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Accounting',
    path: 'accounting',
    icon: 'omrs-icon-money',
  }),
  options,
);
