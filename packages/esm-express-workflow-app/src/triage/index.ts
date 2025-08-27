import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../constants';
import Triage from './triage.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const triageDashboard = getSyncLifecycle(Triage, options);
export const triageLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Triage',
    path: 'triage',
    icon: 'omrs-icon-activity',
  }),
  options,
);
