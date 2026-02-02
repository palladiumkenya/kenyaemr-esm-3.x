import { getSyncLifecycle } from '@openmrs/esm-framework';

import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { moduleName } from '../../constants';
import LaboratoryTabs from './laboratory-tabs.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const laboratoryDashboard = getSyncLifecycle(LaboratoryTabs, options);
// t('labOrders', 'Lab Orders')
export const laboratoryLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    path: 'laboratory',
    title: 'labOrders',
    icon: 'omrs-icon-microscope',
  }),
  options,
);
