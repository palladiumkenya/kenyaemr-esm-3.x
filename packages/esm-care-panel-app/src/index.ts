import { getAsyncLifecycle, defineConfigSchema, registerBreadcrumbs, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';

const moduleName = '@kenyaemr/esm-care-panel-app';

const options = {
  featureName: 'patient-care-panels',
  moduleName,
};
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const patientProgramSummary = getAsyncLifecycle(() => import('./care-panel/care-panel.component'), options);

export const carePanelPatientSummary = getAsyncLifecycle(
  () => import('./patient-summary/patient-summary.component'),
  options,
);
export const deleteRegimenConfirmationDialog = getAsyncLifecycle(
  () => import('./regimen-editor/delete-regimen-modal.component'),
  options,
);

// t('carePanel', 'Care panel')
export const carePanelSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...dashboardMeta, moduleName }),
  options,
);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
}
