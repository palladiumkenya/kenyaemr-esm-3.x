import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import AdmissionsDashboard from './admissions-dashboard.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib/src';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const admissionsDashboard = getSyncLifecycle(AdmissionsDashboard, options);
// t('Admissions', 'Admissions')
export const admissionsDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'admissions',
    title: 'Admissions',
    icon: 'omrs-icon-hospital-bed',
  }),
  options,
);
