import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const backendDependencies = {
  kenyaemr: '^18.2.0',
};

function setupOpenMRS() {
  const moduleName = '@kenyaemr/esm-version-app';

  const options = {
    featureName: 'esm-version-app',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [
      {
        route: 'about',
        load: getAsyncLifecycle(() => import('./root.component'), options),
      },
    ],
    extensions: [
      {
        name: 'about--link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./about-link.component'), options),
        online: true,
        offline: false,
        order: 0,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
