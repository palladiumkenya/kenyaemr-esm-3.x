import { getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';

import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import PharmacyTabs from './pharmacy-tabs.component';
import Pharmacy from './pharmacy.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

// t('pharmacy', 'Pharmacy')
export const pharmacyLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'pharmacy',
    title: 'pharmacy',
  }),
  options,
);
export const pharmacy = getSyncLifecycle(Pharmacy, options);
export const pharmacyTabs = getSyncLifecycle(PharmacyTabs, options);

// t('precription', 'Prescription')
export const pharmacyPatientChartDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'pharmacy',
    title: 'prescription',
    icon: 'omrs-icon-medication',
  }),
  options,
);
export const pharmacyOrders = getAsyncLifecycle(() => import('./orders/pharmacy-orders.component'), options);
