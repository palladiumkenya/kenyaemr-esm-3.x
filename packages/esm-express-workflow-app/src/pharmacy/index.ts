import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../constants';
import Pharmacy from './pharmacy.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const pharmacyDashboard = getSyncLifecycle(Pharmacy, options);
export const pharmacyLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Pharmacy',
    path: 'pharmacy',
    icon: 'omrs-icon-drug-order',
  }),
  options,
);
