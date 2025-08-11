export const maternalAndChildHealthDashboardMeta = {
  title: 'Maternal & Child Health',
  slot: 'patient-chart-maternal-and-child-health-slot',
  path: 'maternal-and-child-health',
  icon: 'omrs-icon-pedestrian-family',
  showWhenExpression:
    'activePatientEnrollment.filter(enrollment => enrollment.program.name === "MCH - Mother Services").length > 0',
};
