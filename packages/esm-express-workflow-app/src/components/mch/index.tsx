import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import MCHDashboard from './dashboard.component';
import Programs from './programs/programs.component';
import ProgramForm from './programs/program.workspace';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const mchDashboard = getSyncLifecycle(MCHDashboard, options);
export const mchLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    title: 'MCH',
    name: 'mch',
  }),
  options,
);

export const mchProgramManagement = getSyncLifecycle(Programs, options);
export const mchProgramForm = getSyncLifecycle(ProgramForm, options);
