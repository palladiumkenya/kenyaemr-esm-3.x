import { getAsyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  kenyaemr: '^18.2.0',
};

function setupOpenMRS() {
  const moduleName = '@kenyaemr/esm-care-panel-app';

  const options = {
    featureName: 'patient-care-panels',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [],
    extensions: [
      {
        name: 'patient-program-summary',
        slot: 'top-of-all-patient-dashboards-slot',
        order: 1,
        load: getAsyncLifecycle(() => import('./care-panel/care-panel.component'), options),
        online: true,
        offline: false,
      },
      {
        name: 'patient-summary',
        slot: 'top-of-all-patient-dashboards-slot',
        order: 2,
        load: getAsyncLifecycle(() => import('./patient-summary/patient-summary.component'), options),
        online: true,
        offline: false,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
