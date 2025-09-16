import { getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

import { moduleName } from '../../constants';
import ConsultationDashboard from './dashboard.component';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import ClinicalEncounter from './clinical-encounter/clinical-encounter.component';

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

export const clinicalEncounter = getSyncLifecycle(ClinicalEncounter, options);
// TODO: register Stethoscope icon in the icon registry
export const clinicalEncounterLink = getSyncLifecycle(
  createDashboardLink({
    title: 'Clinical Encounter',
    path: 'clinical-encounter',
    icon: 'omrs-icon-syringe',
  }),
  options,
);
