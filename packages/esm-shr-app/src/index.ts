import {
  defineConfigSchema,
  getAsyncLifecycle,
  getFeatureFlag,
  getSyncLifecycle,
  registerBreadcrumbs,
  registerFeatureFlag,
} from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { referralDashboardMeta, shrSummaryDashboardMeta } from './dashboard.meta';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import shrPatientSummaryComponent from './shrpatient-summary/shrpatient-summary.component';
import { createHomeDashboardLink } from './create-dashboard-link';
import ReferralReasonsDialogPopup from './referrals/referral-reasons/referral-reasons.component';
import ReferralChartView from './referrals/patient-chart/referral-chart-view.component';
import FacilityRefferalForm from './workspace/referrals.workspace.component';
import SHRAuthorizationForm from './shr-summary/shr-authorization-form.workspace';
import SHRSummaryPanel from './shr-summary/shr-summary.component';

const moduleName = '@kenyaemr/esm-shr-app';

const options = {
  featureName: '@kenyaemr/esm-shr-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const shrPatientSummary = getSyncLifecycle(shrPatientSummaryComponent, options);

export function startupApp() {
  registerBreadcrumbs([]);
  registerFeatureFlag('shr-summary', 'SHR Summary', 'Adds authorization to pull a ptient SHR information');
  defineConfigSchema(moduleName, configSchema);
}

export const ReferralsDashboardLink = getSyncLifecycle(
  createHomeDashboardLink({
    name: 'referrals',
    title: 'Referrals',
  }),
  options,
);

export const shrSummaryDashboardLink = getFeatureFlag('shr-summary')
  ? getSyncLifecycle(createDashboardLink({ ...shrSummaryDashboardMeta, moduleName }), options)
  : undefined;

export const shrRoot = getAsyncLifecycle(() => import('./shr-root.component'), options);

export const referralReasonsDialogPopup = getSyncLifecycle(ReferralReasonsDialogPopup, {
  featureName: 'View Referral Reasons',
  moduleName,
});

// Dashboard links for referrals and the corresponding view in the patient chart
export const referralWidget = getSyncLifecycle(ReferralChartView, options);
export const referralLink = getSyncLifecycle(createDashboardLink(referralDashboardMeta), options);
export const facilityRefferalForm = getSyncLifecycle(FacilityRefferalForm, options);

// SHR Summary
export const patientSHRSummary = getSyncLifecycle(SHRSummaryPanel, options);
export const shrAuthorizationForm = getSyncLifecycle(SHRAuthorizationForm, options);
