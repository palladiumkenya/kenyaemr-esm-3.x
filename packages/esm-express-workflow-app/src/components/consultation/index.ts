import { getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

import { moduleName } from '../../constants';
import { createLeftPanelLink } from '../../shared/dashboard-link/dashboard-link.component';
import ClinicalEncounter from './clinical-encounter/clinical-encounter.component';
import EncounterDetails from './clinical-encounter/encounter-details.component';
import ConsultationDashboard from './dashboard.component';

const options = {
  featureName: 'express-workflow',
  moduleName,
};

export const consultationDashboard = getSyncLifecycle(ConsultationDashboard, options);
// t('consultation', 'Consultation')
export const consultationLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    title: 'consultation',
    name: 'consultation',
  }),
  options,
);

export const clinicalEncounter = getSyncLifecycle(ClinicalEncounter, options);
// TODO: register Stethoscope icon in the icon registry
// t('clinicalEncounter', 'Clinical Encounter')
export const clinicalEncounterLink = getSyncLifecycle(
  createDashboardLink({
    title: 'clinicalEncounter',
    path: 'clinical-encounter',
    icon: 'omrs-icon-syringe',
  }),
  options,
);

export const encounterDetails = getSyncLifecycle(EncounterDetails, options);
