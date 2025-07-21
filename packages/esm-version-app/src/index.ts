import {
  HealthCross,
  Home,
  HospitalBed,
  Hotel,
  Money,
  Movement,
  Stethoscope,
  TcpIpService,
  UserMultiple,
} from '@carbon/react/icons';
import { defineConfigSchema, getSyncLifecycle, translateFrom } from '@openmrs/esm-framework';
import HomeRoot from './app-navigation/root-overrides.component';
import { createDashboardGroup, createLeftPanelLink } from './app-navigation/nav-utils';
import { configSchema } from './config-schema';
import rootComponent from './root.component';

const moduleName = '@kenyaemr/esm-version-app';

const options = {
  featureName: 'esm-version-app',
  moduleName,
};

export const importTranslations = require.context('../translations', false, /.json$/, 'lazy');

export const about = getSyncLifecycle(rootComponent, options);
export const diagnosticsDashboardNavGroup = getSyncLifecycle(
  createDashboardGroup({
    slotName: 'diagnostics-group-nav-slot',
    title: 'Diagnostics',
    icon: Stethoscope,
    isExpanded: false,
  }),
  options,
);
// t('Patient services', 'Patient services')
export const patientServicesDashboardNavGroup = getSyncLifecycle(
  createDashboardGroup({
    slotName: 'patient-services-group-nav-slot',
    title: 'Patient services',
    icon: UserMultiple,
    isExpanded: false,
  }),
  options,
);
// t('Linkage services', 'Linkage services')
export const linkageServicesDashboardNavGroup = getSyncLifecycle(
  createDashboardGroup({
    slotName: 'linkage-services-group-nav-slot',
    title: 'Linkage services',
    icon: HealthCross,
    isExpanded: false,
  }),
  options,
);
// t('Billing module', 'Billing module')
export const billingDashboardNavGroup = getSyncLifecycle(
  createDashboardGroup({
    slotName: 'billing-dashboard-group-nav-slot',
    title: 'Billing module',
    icon: Money,
    isExpanded: false,
  }),
  options,
);

// t('Claims management', 'Claims management')
export const claimsManagementSideNavGroup = getSyncLifecycle(
  createDashboardGroup({
    title: 'Claims Management',
    slotName: 'claims-management-dashboard-link-slot',
    isExpanded: false,
    icon: Movement,
  }),
  options,
);

// t('clinicalConsultation', 'Clinical consultation')
export const patientChartClinicalConsultationNavGroup = getSyncLifecycle(
  createDashboardGroup({
    title: 'Clinical Consultation',
    slotName: 'patient-chart-clinical-consultation-nav-group-slot',
    isExpanded: false,
  }),
  options,
);

// t('Home', 'Home')
export const homeDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home', title: 'Home', icon: Home }),
  options,
);
export const homeRoot = getSyncLifecycle(HomeRoot, options);
export const inpatientDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home/bed-admission', title: 'In Patient View', icon: HospitalBed }),
  options, // uses slot bed-admission-dashboard-slot
);
// t('Referrals', 'Referrals')
export const referralsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home/referrals', title: 'Referrals', icon: TcpIpService }),
  options,
);
// t('Wards', 'Wards')
export const wardsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home/ward', title: 'Wards', icon: HospitalBed }),
  options,
);
// t('Mortuary', 'Mortuary')
export const mortuaryDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home/morgue', title: 'Mortuary', icon: Hotel }),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
