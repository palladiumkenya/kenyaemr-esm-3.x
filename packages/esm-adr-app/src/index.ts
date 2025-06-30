import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import AdrAssessmentApp from './root.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import SideMenu from './components/side-menu/side-menu.component';
import Summary from './components/summary/summary.component';

const moduleName = '@kenyaemr/esm-adr-app';

const options = {
  featureName: 'adr-assessment',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const adrAssessmentApp = getSyncLifecycle(AdrAssessmentApp, options);
export const adrAssessmentSideNav = getSyncLifecycle(SideMenu, options);
export const adrAssessmentSummary = getSyncLifecycle(Summary, options);
export const patientAdrWorkspace = getAsyncLifecycle(() => import('./components/patient-adr.workspace'), options);

// Dashboard link for the search page
export const overviewDashboardLink = getSyncLifecycle(
  createDashboardLink({ moduleName, path: 'overview', title: 'Overview', icon: '' }),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
