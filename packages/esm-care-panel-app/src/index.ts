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
        slot: 'patient-chart-summary-dashboard-slot',
        order: 1,
        load: getAsyncLifecycle(() => import('./care-panel/care-panel.component'), options),
        meta: {
          columnSpan: 4,
        },
        online: true,
        offline: false,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
