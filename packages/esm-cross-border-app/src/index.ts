import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import CrossBorderApp from './root.component';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import SideMenu from './components/side-menu/side-menu.component';
import MPISearch from './components/search/mpi-search.component';

const moduleName = '@kenyaemr/esm-cross-border-app';

const options = {
  featureName: 'cross-border',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const crossBorderApp = getSyncLifecycle(CrossBorderApp, options);

export const crossBorderSideNav = getSyncLifecycle(SideMenu, options);

export const crossBorderSearch = getSyncLifecycle(MPISearch, options);

// Dashboard link for the search page
export const crossBorderSearchDashboardLink = getSyncLifecycle(
  createDashboardLink({ moduleName, path: 'search', title: 'Search' }),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
