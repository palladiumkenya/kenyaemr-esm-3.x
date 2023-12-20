export const ClinicalDashboardGroup = {
  title: 'Clinical View',
  slotName: 'patient-clinical-view-slot',
  isExpanded: true,
};

export const mchDashboardMeta = {
  slot: 'patient-chart-mch-dashboard-slot',
  columns: 1,
  title: 'MCH Dashboard',
  path: 'mch-dashboard',
  moduleName: '@kenyaemr/esm-patient-clinical-view-app',
  config: {},
};

export const defaulterTracingDashboardMeta = {
  slot: 'patient-chart-defaulter-tracing-dashboard-slot',
  columns: 1,
  title: 'Defaulter Tracing Dashboard',
  path: 'defaulter-tracing-dashboard',
  moduleName: '@kenyaemr/esm-patient-clinical-view-app',
  config: {},
};
