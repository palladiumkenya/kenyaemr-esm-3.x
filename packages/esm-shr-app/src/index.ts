import { defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import shrPatientSummaryComponent from './shrpatient-summary/shrpatient-summary.component';

const moduleName = '@kenyaemr/esm-shr-app';

const options = {
  featureName: 'patient-shr',
  moduleName,
};
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const shrPatientSummary = getSyncLifecycle(shrPatientSummaryComponent, options);

// t('sharedhealthrecords', 'Shared Health Records')
export const shrSummaryDashboardLink = getSyncLifecycle(createDashboardLink({ ...dashboardMeta, moduleName }), options);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
}
