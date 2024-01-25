import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import MaternalHealthList from './hiv-care-and-treatment-services/maternal-and-child-health/views/maternal-health/maternal-health.component';
import { createDashboardGroup } from './clinical-view-group/createDashboardGroup';
import {
  hivCareAndTreatmentNavGroup,
  mchDashboardMeta,
  defaulterTracingDashboardMeta,
  htsDashboardMeta,
  clinicalEncounterDashboardMeta,
  familyHistoryDashboardMeta,
  outPatientDepartmentNavGroup,
  inPatientDepartmentNavGroup,
} from './dashboard.meta';
import DefaulterTracing from './hiv-care-and-treatment-services/defaulter-tracing/defaulter-tracing.component';
import InPatientView from './in-patient-department/in-patient.component';
import FamilyHistory from './out-patient-department/family-history/family-history.component';

import HivTestingEncountersList from './hiv-care-and-treatment-services/hiv-testing-services/views/hiv-testing/hiv-testing-services.component';
import ClinicalViewSection from './clinical-view-group/clinical-view-section.component';
const moduleName = '@kenyaemr/esm-patient-clinical-view-app';

const options = {
  featureName: 'patient-clinical-view-app',
  moduleName,
};
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

// patient-chart-dashboard-groups
export const hivCareAndTreatMentSideNavGroup = getSyncLifecycle(
  createDashboardGroup(hivCareAndTreatmentNavGroup),
  options,
);
export const outPatientDepartmentSideNavGroup = getSyncLifecycle(
  createDashboardGroup(outPatientDepartmentNavGroup),
  options,
);
export const inPatientDepartmentSideNavGroup = getSyncLifecycle(
  createDashboardGroup(inPatientDepartmentNavGroup),
  options,
);

export const mchDashboardLink = getSyncLifecycle(createDashboardLink(mchDashboardMeta), options);
export const defaulterTracingLink = getSyncLifecycle(createDashboardLink(defaulterTracingDashboardMeta), options);
export const htsDashboardLink = getSyncLifecycle(createDashboardLink(htsDashboardMeta), options);
export const clinicalEncounterLink = getSyncLifecycle(createDashboardLink(clinicalEncounterDashboardMeta), options);
export const familyHistoryLink = getSyncLifecycle(createDashboardLink(familyHistoryDashboardMeta), options);

// Views
export const mchClinicalView = getSyncLifecycle(MaternalHealthList, options);
export const defaulterTracing = getSyncLifecycle(DefaulterTracing, options);
export const familyHistory = getSyncLifecycle(FamilyHistory, options);
export const htsClinicalView = getSyncLifecycle(HivTestingEncountersList, options);
export const clinicalEncounter = getSyncLifecycle(InPatientView, options);
export const clinicalViewPatientDashboard = getSyncLifecycle(ClinicalViewSection, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
