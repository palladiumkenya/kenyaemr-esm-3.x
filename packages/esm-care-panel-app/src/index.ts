import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta, hivPatientSummaryDashboardMeta } from './dashboard.meta';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import carePanelComponent from './care-panel/care-panel.component';
import careProgramsComponent from './care-programs/care-programs.component';
import deleteRegimenConfirmationDialogComponent from './regimen-editor/delete-regimen-modal.component';
import regimenFormComponent from './regimen-editor/regimen-form.component';
import CarePanelDashboard from './care-panel-dashboard/care-panel-dashboard.component';
import PatientSummary from './patient-summary/patient-summary.component';
import DispensingPatientVitals from './dispensing-patient-details/patient-vitals.component';
import PatientDischargeSideRailIcon from './patient-discharge/discharge-workspace-siderail.component';
import PatientDischargeWorkspace from './patient-discharge/patient-discharge.workspace';
import ProgramForm from './care-programs/program.workspace';

const moduleName = '@kenyaemr/esm-care-panel-app';

const options = {
  featureName: 'patient-care-panels',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
}

export const carePanelPatientSummary = getSyncLifecycle(CarePanelDashboard, options);

export const deleteRegimenConfirmationDialog = getSyncLifecycle(deleteRegimenConfirmationDialogComponent, options);

export const patientProgramSummary = getSyncLifecycle(carePanelComponent, options);

export const patientCareProgram = getSyncLifecycle(careProgramsComponent, {
  moduleName: 'patient-care-programs',
  featureName: 'care-programs',
});

// t('carePanel', 'Care panel')
export const carePanelSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, icon: 'omrs-icon-document', moduleName }),
  options,
);
export const hivPatientSummary = getSyncLifecycle(PatientSummary, options);
export const regimenFormWorkspace = getSyncLifecycle(regimenFormComponent, options);

export const dispensingPaentientVitals = getSyncLifecycle(DispensingPatientVitals, options);

export const patientDischargeSideRailIcon = getSyncLifecycle(PatientDischargeSideRailIcon, options);
export const patientDischargeWorkspace = getAsyncLifecycle(
  () => import('./patient-discharge/patient-discharge.workspace'),
  options,
);
export const mchProgramForm = getSyncLifecycle(ProgramForm, options);
