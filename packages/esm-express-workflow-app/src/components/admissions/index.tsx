import { getSyncLifecycle } from '@openmrs/esm-framework';

import { createDashboardLink } from '@openmrs/esm-patient-common-lib/src';
import { moduleName } from '../../constants';
import AdmissionsDashboard from './admissions-dashboard.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const admissionsDashboard = getSyncLifecycle(AdmissionsDashboard, options);
// t('inPatient', 'In-Patient')
export const admissionsDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'admissions',
    title: 'inPatient',
    icon: 'omrs-icon-hospital-bed',
  }),
  options,
);
