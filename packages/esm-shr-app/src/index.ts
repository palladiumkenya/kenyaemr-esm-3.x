import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { createHomeDashboardLink } from './create-dashboard-link';
import { referralDashboardMeta, shrSummaryDashboardMeta } from './dashboard.meta';
import ReferralChartView from './referrals/patient-chart/referral-chart-view.component';
import ReferralReasonsDialogPopup from './referrals/referral-reasons/referral-reasons.component';
import SHRAuthorizationForm from './shr-summary/shr-authorization-form.workspace';
import SHRSummaryPanel from './shr-summary/shr-summary.component';
import shrPatientSummaryComponent from './shrpatient-summary/shrpatient-summary.component';
import FacilityRefferalForm from './workspace/referrals.workspace.component';

const moduleName = '@kenyaemr/esm-shr-app';

const options = {
  featureName: '@kenyaemr/esm-shr-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const shrPatientSummary = getSyncLifecycle(shrPatientSummaryComponent, options);

export function startupApp() {
  registerBreadcrumbs([]);
  defineConfigSchema(moduleName, configSchema);
}

export const ReferralsDashboardLink = getSyncLifecycle(
  createHomeDashboardLink({
    name: 'referrals',
    title: 'Referrals',
  }),
  options,
);

export const shrSummaryDashboardLink = getSyncLifecycle(
  createDashboardLink({ ...shrSummaryDashboardMeta, moduleName }),
  options,
);

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
