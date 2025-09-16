import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import ProceduresTabs from './procedures-tabs.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const proceduresDashboard = getSyncLifecycle(ProceduresTabs, options);
// t('Procedures', 'Procedures')
export const proceduresLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    path: 'procedures',
    title: 'Procedures',
    icon: 'omrs-icon-movement',
  }),
  options,
);
