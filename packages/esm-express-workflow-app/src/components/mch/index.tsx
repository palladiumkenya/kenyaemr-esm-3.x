import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import MCHDashboard from './dashboard.component';
import Programs from './programs/programs.component';
import ProgramForm from './programs/program.workspace';

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

export const mchProgramManagement = getSyncLifecycle(Programs, options);
export const mchProgramForm = getSyncLifecycle(ProgramForm, options);
