import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import CrossBorderApp from './root.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import SideMenu from './components/side-menu/side-menu.component';
import MPISearch from './components/search/mpi-search.component';
import Summary from './components/summary/summary.component';
import FormEntryWorkspace from './components/form-entry/form-entry.component';
import PatientSearch from './components/form-entry/patient-search.component';

const moduleName = '@kenyaemr/esm-cross-border-app';

const options = {
  featureName: 'cross-border',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const crossBorderApp = getSyncLifecycle(CrossBorderApp, options);

export const crossBorderSideNav = getSyncLifecycle(SideMenu, options);
export const crossBorderSearch = getSyncLifecycle(MPISearch, options);
export const crossBorderSummary = getSyncLifecycle(Summary, options);

export const crossBorderFormEntry = getSyncLifecycle(FormEntryWorkspace, options);
export const crossBorderPatientSearch = getSyncLifecycle(PatientSearch, options);

// Dashboard link for the search page
export const overviewDashboardLink = getSyncLifecycle(
  createDashboardLink({ moduleName, path: 'overview', title: 'Overview', icon: 'omrs-icon-inventory-management' }),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
