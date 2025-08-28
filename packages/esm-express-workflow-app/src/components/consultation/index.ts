import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import ConsultationDashboard from './dashboard.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const consultationDashboard = getSyncLifecycle(ConsultationDashboard, options);
export const consultationLeftPanelLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Consultation',
    path: 'consultation',
    icon: 'omrs-icon-user-avatar',
  }),
  options,
);
