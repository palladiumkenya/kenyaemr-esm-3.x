import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import MaternalHealthList from './esm-mch-app/views/maternal-health/maternal-health.component';
import HivTestingEncountersList from './esm-hts-app/views/hiv-testing/hiv-testing-services.component';
const moduleName = '@kenyaemr/esm-patient-clinical-view-app';

const options = {
  featureName: 'patient-clinical-view-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');
// export const mchClinicalView = getSyncLifecycle(MaternalHealthList, options);
export const htsClinicalView = getSyncLifecycle(HivTestingEncountersList, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
