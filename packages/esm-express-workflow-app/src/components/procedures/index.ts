import { getSyncLifecycle } from '@openmrs/esm-framework';

import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { moduleName } from '../../constants';
import ProceduresTabs from './procedures-tabs.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const proceduresDashboard = getSyncLifecycle(ProceduresTabs, options);
// t('procedures', 'Procedures')
export const proceduresLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    path: 'procedures',
    title: 'procedures',
    icon: 'omrs-icon-movement',
  }),
  options,
);
