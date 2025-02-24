import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './left-panel/morgue-left-panel-link.component';
const moduleName = '@kenyaemr/esm-morgue-app';

const options = {
  featureName: 'esm-morgue-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  const morgueBasepath = `${window.spaBase}/home/morgue`;

  defineConfigSchema(moduleName, configSchema);
  registerBreadcrumbs([
    {
      title: 'morgue',
      path: morgueBasepath,
      parent: `${window.spaBase}/home`,
    },
  ]);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const morgueDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'morgue',
    title: 'Mortuary',
  }),
  options,
);

export const patientAdditionalInfoForm = getAsyncLifecycle(
  () => import('./workspaces/patientAdditionalInfoForm.workspace'),
  options,
);
export const dischargeBodyForm = getAsyncLifecycle(() => import('./workspaces/discharge-body.workspace'), options);
export const admitBodyForm = getAsyncLifecycle(() => import('./workspaces/admit-body.workspace'), options);
export const swapForm = getAsyncLifecycle(() => import('./workspaces/swap-unit.workspace'), options);
export const actionBarButtons = getAsyncLifecycle(() => import('./extension/actionButton.component'), options);
export const bannerInfo = getAsyncLifecycle(() => import('./extension/deceasedInfoBanner.component'), options);
