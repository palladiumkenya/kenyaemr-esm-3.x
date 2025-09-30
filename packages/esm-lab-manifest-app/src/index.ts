import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import SideNav from './side-menu/side-menu.component';
import { labManifestDashboardMeta, manifestDashboardMeta } from './dashboard.meta';
import { createDashboardLink } from './nav/left-panel-link.component';

const moduleName = '@kenyaemr/esm-lab-manifest-app';

const options = {
  featureName: 'esm-lab-manifest-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  const labManifestBasepath = `${window.spaBase}/lab-manifest`;

  defineConfigSchema(moduleName, configSchema);
  registerBreadcrumbs([
    {
      title: 'lab-manifest',
      path: labManifestBasepath,
      parent: `${window.spaBase}`,
    },
  ]);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const labManifestForm = getAsyncLifecycle(() => import('./forms/lab-manifest-form.workspace'), options);
export const labManifestOrderToManifestForm = getAsyncLifecycle(
  () => import('./forms/lab-manifest-orders-to-manifest.modal'),
  options,
);
export const sampleDeleteConfirmDialog = getAsyncLifecycle(
  () => import('./forms/sample-delete-confirm-dialog.modal'),
  options,
);
export const manifestStatusChangeConfirmModal = getAsyncLifecycle(
  () => import('./forms/manifest-status-change-confirm.modal'),
  options,
);
export const requeueLabManifestConfirmModal = getAsyncLifecycle(
  () => import('./forms/lab-manifest-requeue-confirm.modal'),
  options,
);

// t('labManifestSideNav', 'Lab ManifestSideNav')
export const labManifestSideNav = getSyncLifecycle(SideNav, options);
// t('labManifestDashboard', 'Lab Manifest Dashboard')
export const labsManifestsDashboardLink = getSyncLifecycle(createDashboardLink(labManifestDashboardMeta), options);
// t('manifestOverviewDashboard', 'Manifest Overview Dashboard')
export const manifestOverviewDashboardLink = getSyncLifecycle(createDashboardLink(manifestDashboardMeta), options);
// t('labManifestComponent', 'Lab Manifest Component')
export const labManifestComponent = getAsyncLifecycle(() => import('./component/lab-manifest.component'), options);
export const labManifestDetail = getAsyncLifecycle(() => import('./component/lab-manifest-detail.component'), options);
export const labManifestOverview = getAsyncLifecycle(
  () => import('./component/lab-manifest-overview.component'),
  options,
);
