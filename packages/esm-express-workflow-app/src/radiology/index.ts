import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../constants';
import Radiology from './radiology.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const radiologyDashboard = getSyncLifecycle(Radiology, options);
export const radiologyLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Radiology',
    path: 'radiology',
    icon: 'omrs-icon-user-xray',
  }),
  options,
);
