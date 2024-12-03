import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './left-panel/providers-left-panel-link.component';
import { moduleName, providerBasePath } from './constants';
import HWREmptyModal from './modal/provider-empty-modal.component';
import HWRConfirmModal from './modal/provider-information.modal.componet';
import HWRSyncModal from './modal/provider-sync-modal.component';

const options = {
  featureName: 'esm-providers-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
  registerBreadcrumbs([
    {
      title: 'providers',
      path: providerBasePath,
      parent: `${window.spaBase}/home`,
    },
  ]);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const providersDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'providers',
    title: 'Providers',
  }),
  options,
);

export const providerDetailsWorkspace = getAsyncLifecycle(() => import('./workspace/provider-form.workspace'), options);
export const hwrConfirmationModal = getSyncLifecycle(HWRConfirmModal, options);
export const hwrSyncmodal = getSyncLifecycle(HWRSyncModal, options);
export const hwrEmptymodel = getSyncLifecycle(HWREmptyModal, options);
