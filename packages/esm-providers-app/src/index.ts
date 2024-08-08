import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './providers-left-panel/providers-left-panel-link.component';
const moduleName = '@kenyaemr/esm-providers-app';

const options = {
  featureName: 'esm-providers-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  const morgueBasepath = `${window.spaBase}/home/providers`;

  defineConfigSchema(moduleName, configSchema);
  registerBreadcrumbs([
    {
      title: 'providers',
      path: providerBasepath,
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
