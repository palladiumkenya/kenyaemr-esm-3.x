import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import Laboratory from './laboratory.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const laboratoryRootDashboard = getSyncLifecycle(Laboratory, options);
export const laboratoryLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Labs',
    path: 'lab',
    icon: 'omrs-icon-microscope',
  }),
  options,
);
