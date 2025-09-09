import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import MCHDashboard from './dashboard.component';
import Partograph from './mch-patient-profile/partograph/partograph-conponent';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const mchDashboard = getSyncLifecycle(MCHDashboard, options);
export const mchLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'MCH',
    path: 'mch',
    icon: 'omrs-icon-pedestrian-family',
  }),
  options,
);


export const patientchartPartograph = getSyncLifecycle(Partograph, options)