import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  kenyaemr: '^18.2.0',
};

function setupOpenMRS() {
  const moduleName = '@kenyaemr/esm-patient-flags-app';

  const options = {
    featureName: 'patient-flags',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [],
    extensions: [
      {
        name: 'patient-flag',
        slot: 'top-of-all-patient-dashboards-slot',
        load: getAsyncLifecycle(() => import('./patient-flags/patient-flags.component'), options),
        online: true,
        offline: false,
      },
      {
        name: 'kenyaemr-home-link',
        slot: 'app-menu-slot',
        load: getAsyncLifecycle(() => import('./kenyaemr-link/kenyaemr-link.component'), options),
        online: true,
        offline: false,
        order: 0,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
