import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../constants';
import Laboratory from './laboratory.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const laboratoryDashboard = getSyncLifecycle(Laboratory, options);
export const laboratoryLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Labs',
    path: 'laboratory',
    icon: 'omrs-icon-microscope',
  }),
  options,
);
