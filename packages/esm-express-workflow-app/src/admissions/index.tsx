import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../constants';
import Admissions from './admissions.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const admissionsDashboard = getSyncLifecycle(Admissions, options);
export const admissionsLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Admissions',
    path: 'admissions',
    icon: 'omrs-icon-list-checked',
  }),
  options,
);
