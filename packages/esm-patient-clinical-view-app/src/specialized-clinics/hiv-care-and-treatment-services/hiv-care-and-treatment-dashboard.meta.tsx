export const htsDashboardMeta = {
  slot: 'patient-chart-hts-dashboard-slot',
  columns: 1,
  title: 'HIV Testing Services',
  path: 'hts-dashboard',
  moduleName: '@kenyaemr/esm-patient-clinical-view-app',
  icon: '',
};
export const defaulterTracingDashboardMeta = {
  slot: 'patient-chart-defaulter-tracing-dashboard-slot',
  columns: 1,
  title: 'Defaulter Tracing',
  path: 'defaulter-tracing-dashboard',
  moduleName: '@kenyaemr/esm-patient-clinical-view-app',
  icon: '',
};

export const hivCareAndTreatmentNavGroup = {
  title: 'HIV Care & Treatment',
  slotName: 'hiv-care-and-treatment-slot',
  isExpanded: false,
  isChild: true,
  showWhenExpression: "enrollment.includes('HIV')",
};
