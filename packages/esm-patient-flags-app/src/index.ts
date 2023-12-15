import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import clearCacheButtonComponent from './clear-cache/clear-cache.component';
import kenyaEmr2ChartLinkComponent from './kenyaemr-link/kenyaemr-chart-link.component';
import kenyaEmrHomeLinkComponent from './kenyaemr-link/kenyaemr-link.component';
import patientFlagsComponent from './patient-flags/patient-flags.component';
import facilityDashboardComponent from './dashboard-analytics/dashboard-analytics.component';

const moduleName = '@kenyaemr/esm-patient-flags-app';

const options = {
  featureName: 'patient-flags',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const clearCacheButton = getSyncLifecycle(clearCacheButtonComponent, options);
export const kenyaemr2ChartLink = getSyncLifecycle(kenyaEmr2ChartLinkComponent, options);
export const kenyaemrHomeLink = getSyncLifecycle(kenyaEmrHomeLinkComponent, options);
export const patientFlag = getSyncLifecycle(patientFlagsComponent, options);
export const kenyaemrFacilityDashboard = getSyncLifecycle(facilityDashboardComponent, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
