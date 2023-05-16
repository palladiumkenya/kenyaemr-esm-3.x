import { getAsyncLifecycle, defineConfigSchema } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

const importTranslation = require.context( "../translations", false, /.json$/, "lazy");

const backendDependencies = {
  kenyaemr: '^18.2.0',
};

function setupOpenMRS() {
  const moduleName = "@kenyaemr/esm-care-panels-app";

  const options = {
    featureName: "patient-care-panels",
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [],
    extensions: [
      {
        name: 'patient-care-panels',
        slot: 'top-of-all-patient-dashboards-slot',
        load: getAsyncLifecycle(() => import('./care-panels/care-panels.component'), options),
        online: true,
        offline: false
      }
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
