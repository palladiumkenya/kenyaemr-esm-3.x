export const hivCareAndTreatmentDashboardMeta = {
  slot: 'patient-chart-hiv-care-and-treatment-dashboard-slot',
  columns: 1,
  title: 'HIV Care & Treatment',
  path: 'hiv-care-and-treatment-dashboard',
  moduleName: '@kenyaemr/esm-patient-clinical-view-app',
  icon: 'omrs-icon-programs',
  showWhenExpression: 'patientEnrollments.filter(enrollment => enrollment.program.name === "HIV").length > 0',
};
