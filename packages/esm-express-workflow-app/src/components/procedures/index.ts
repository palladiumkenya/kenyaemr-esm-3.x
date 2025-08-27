import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import Procedures from './procedures.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const proceduresDashboard = getSyncLifecycle(Procedures, options);
export const proceduresLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Procedures',
    path: 'procedures',
    icon: 'omrs-icon-syringe',
  }),
  options,
);
