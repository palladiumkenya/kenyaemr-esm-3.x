import { getSyncLifecycle } from '@openmrs/esm-framework';

import Pharmacy from './pharmacy.component';
import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const pharmacyLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'pharmacy',
    title: 'Pharmacy',
  }),
  options,
);
export const pharmacy = getSyncLifecycle(Pharmacy, options);
