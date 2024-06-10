import { defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta, hivPatientSummaryDashboardMeta } from './dashboard.meta';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import carePanelComponent from './care-panel/care-panel.component';
import careProgramsComponent from './care-programs/care-programs.component';
import deleteRegimenConfirmationDialogComponent from './regimen-editor/delete-regimen-modal.component';
import regimenFormComponent from './regimen-editor/regimen-form.component';
import CarePanelDashboard from './care-panel-dashboard/care-panel-dashboard.component';
import PatientSummary from './patient-summary/patient-summary.component';

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
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);
export const hivPatientSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...hivPatientSummaryDashboardMeta, moduleName }),
  options,
);
export const hivPatientSummary = getSyncLifecycle(PatientSummary, options);
export const regimenFormWorkspace = getSyncLifecycle(regimenFormComponent, options);
