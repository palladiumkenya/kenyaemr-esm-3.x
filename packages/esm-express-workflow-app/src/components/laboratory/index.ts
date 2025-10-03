import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import LaboratoryTabs from './laboratory-tabs.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib/src';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const laboratoryDashboard = getSyncLifecycle(LaboratoryTabs, options);
// t('Laboratory', 'Laboratory')
export const laboratoryLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    path: 'laboratory',
    title: 'Laboratory',
    icon: 'omrs-icon-microscope',
  }),
  options,
);
