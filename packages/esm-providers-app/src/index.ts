import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './providers-left-panel/providers-left-panel-link.component';
import { moduleName, providerBasePath } from './constants';
import providerMessageAlertComponent from './provider-alert-message/provider-alert-message.component';
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
export const providerMessageAlert = getSyncLifecycle(providerMessageAlertComponent, options);
