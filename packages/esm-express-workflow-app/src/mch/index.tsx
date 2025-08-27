import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../constants';
import MCH from './mch.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const mchDashboard = getSyncLifecycle(MCH, options);
export const mchLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'MCH',
    path: 'mch',
    icon: 'omrs-icon-pedestrian-family',
  }),
  options,
);
