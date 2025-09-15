import { getSyncLifecycle } from '@openmrs/esm-framework';

import { moduleName } from '../../constants';
import ConsultationDashboard from './dashboard.component';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const consultationDashboard = getSyncLifecycle(ConsultationDashboard, options);
export const consultationLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    title: 'Consultation',
    name: 'consultation',
  }),
  options,
);
