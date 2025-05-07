import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
// import { createLeftPanelLink } from './nav/left-panel-link.component';
import { createDashboardGroup } from '@openmrs/esm-patient-common-lib';
import { createLeftPanelLink } from './nav/left-panel-link.component';

const moduleName = '@kenyaemr/esm-lab-manifest-app';

const options = {
  featureName: 'esm-lab-manifest-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  const labManifestBasepath = `${window.spaBase}/home/lab-manifest`;

  defineConfigSchema(moduleName, configSchema);
  registerBreadcrumbs([
    {
      title: 'lab-manifest',
      path: labManifestBasepath,
      parent: `${window.spaBase}/home`,
    },
  ]);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);
export const labManifestOverview = getAsyncLifecycle(
  () => import('./component/lab-manifest-overview.component'),
  options,
);

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
export const labManifestSideNavGroup = getSyncLifecycle(
  createDashboardGroup({
    title: 'Lab Manifest',
    slotName: 'lab-manifest-dashbaord-link-slot',
    isExpanded: false,
  }),
  options,
);
export const manifestOverviewDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'lab-manifest/overview',
    title: 'Overview',
  }),
  options,
);
export const manifestsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'lab-manifest',
    title: 'Manifests',
  }),
  options,
);
