import { defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import carePanelComponent from './care-panel/care-panel.component';
import carePanelPatientSummaryComponent from './patient-summary/patient-summary.component';
import careProgramsComponent from './care-programs/care-programs.component';
import deleteRegimenConfirmationDialogComponent from './regimen-editor/delete-regimen-modal.component';
import regimenFormComponent from './regimen-editor/regimen-form.component';

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

export const carePanelPatientSummary = getSyncLifecycle(carePanelPatientSummaryComponent, options);

export const deleteRegimenConfirmationDialog = getSyncLifecycle(deleteRegimenConfirmationDialogComponent, options);

export const patientProgramSummary = getSyncLifecycle(carePanelComponent, options);

export const patientCareProgram = getSyncLifecycle(careProgramsComponent, {
  moduleName: 'patient-care-programs',
  featureName: 'care-programs',
});

registerWorkspace({
  name: 'patient-regimen-workspace',
  title: 'Regimen Form',
  load: getSyncLifecycle(regimenFormComponent, options),
  canMaximize: true,
  canHide: true,
  width: 'wider',
  type: 'clinical-form',
});

// t('carePanel', 'Care panel')
export const carePanelSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);
