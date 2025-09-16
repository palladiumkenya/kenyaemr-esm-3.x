import { getSyncLifecycle } from '@openmrs/esm-framework';

import Pharmacy from './pharmacy.component';
import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import PharmacyTabs from './pharmacy-tabs.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib/src';

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
export const pharmacyTabs = getSyncLifecycle(PharmacyTabs, options);
export const pharmacyPatientChartDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'pharmacy',
    title: 'Pharmacy',
    icon: 'omrs-icon-medication',
  }),
  options,
);
