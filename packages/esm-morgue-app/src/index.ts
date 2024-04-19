import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './morgue-left-panel/morgue-left-panel-link.component';
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
    title: 'Morgue',
  }),
  options,
);
