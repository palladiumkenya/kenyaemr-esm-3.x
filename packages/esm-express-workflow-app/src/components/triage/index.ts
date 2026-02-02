import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import TriageDashboard from './dashboard.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const triageDashboard = getSyncLifecycle(TriageDashboard, options);
// t('triage', 'Triage')
export const triageLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'triage',
    title: 'triage',
  }),
  options,
);
