import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './component/left-panel-link.component';

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

export const labManifestDashboardLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'lab-manifest',
    title: 'Lab Manifest',
  }),
  options,
);
