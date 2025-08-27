import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import Consulation from './consulation.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const consulationDashboard = getSyncLifecycle(Consulation, options);
export const consulationLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Consulation',
    path: 'consulation',
    icon: 'omrs-icon-user-avatar',
  }),
  options,
);
