import { defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import shrPatientSummaryComponent from './shrpatient-summary/shrpatient-summary.component';
import { createHomeDashboardLink } from './create-dashboard-link';
import SHRRootComponent from './shr-root.component';

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

export const communityReferralsDashboardLink = getSyncLifecycle(
  createHomeDashboardLink({
    name: 'community-referrals',
    title: 'Community referrals',
  }),
  options,
);

export const shrRoot = getSyncLifecycle(SHRRootComponent, options);
