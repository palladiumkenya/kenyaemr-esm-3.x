import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import kenyaEmr2ChartLinkComponent from './kenyaemr-link/kenyaemr-chart-link.component';
import patientFlagsComponent from './patient-flags/patient-flags.component';
import kenyaemrHomePageComponent from './home-page/home-app.component';

const moduleName = '@kenyaemr/esm-patient-flags-app';

const options = {
  featureName: 'patient-flags',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const kenyaemr2ChartLink = getSyncLifecycle(kenyaEmr2ChartLinkComponent, options);
export const patientFlag = getSyncLifecycle(patientFlagsComponent, options);
export const kenyaemrHomePage = getSyncLifecycle(kenyaemrHomePageComponent, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
