import { getSyncLifecycle } from '@openmrs/esm-framework';

import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { moduleName } from '../../constants';
import Accounting from './accounting.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const accountingDashboard = getSyncLifecycle(Accounting, options);
// t('accounting', 'Accounting')
export const accountingLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'accounting',
    path: 'accounting',
    icon: 'omrs-icon-money',
  }),
  options,
);
