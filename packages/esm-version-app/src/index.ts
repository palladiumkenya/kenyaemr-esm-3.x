import {
  HealthCross,
  Home,
  Movement,
  HospitalBed,
  Money,
  Stethoscope,
  TcpIpService,
  UserMultiple,
  Hotel,
} from '@carbon/react/icons';
import { defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardGroup, createLeftPanelLink } from './app-navigation/nav-utils';
import { configSchema } from './config-schema';
import rootComponent from './root.component';
import HomeRoot from './app-navigation/home-root.component';

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
// clinical-appointments-dashboard-link
export const patientServicesDashboardNavGroup = getSyncLifecycle(
  createDashboardGroup({
    slotName: 'patient-services-group-nav-slot',
    title: 'Patient services',
    icon: UserMultiple,
    isExpanded: false,
  }),
  options,
);
export const linkageServicesDashboardNavGroup = getSyncLifecycle(
  createDashboardGroup({
    slotName: 'linkage-services-group-nav-slot',
    title: 'Linkage services',
    icon: HealthCross,
    isExpanded: false,
  }),
  options,
);
export const billingDashboardNavGroup = getSyncLifecycle(
  createDashboardGroup({
    slotName: 'billing-dashboard-group-nav-slot',
    title: 'Billing Module',
    icon: Money,
    isExpanded: false,
  }),
  options,
);

export const claimsManagementSideNavGroup = getSyncLifecycle(
  createDashboardGroup({
    title: 'Claims Management',
    slotName: 'claims-management-dashboard-link-slot',
    isExpanded: false,
    icon: Movement,
  }),
  options,
);

export const patientChartClinicalConsultationNavGroup = getSyncLifecycle(
  createDashboardGroup({
    title: 'Clinical Consultation',
    slotName: 'patient-chart-clinical-consultation-nav-group-slot',
    isExpanded: false,
  }),
  options,
);

export const homeDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home', title: 'Home', icon: Home }),
  options,
);
export const homeRoot = getSyncLifecycle(HomeRoot, options);
export const inpatientDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home/bed-admission', title: 'In Patient View', icon: HospitalBed }),
  options,
);
export const referralsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home/referrals', title: 'Referrals', icon: TcpIpService }),
  options,
);
export const wardsDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home/ward', title: 'Wards', icon: HospitalBed }),
  options,
);
export const mortuaryDashboardLink = getSyncLifecycle(
  createLeftPanelLink({ route: '/home/morgue', title: 'Mortuary', icon: Hotel }),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
