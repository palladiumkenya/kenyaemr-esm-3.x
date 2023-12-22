export const mchFolderMeta = {
  title: 'Maternal & Child Health',
  slotName: 'mch-slot',
  isExpanded: false,
  patientExpression: 'calculateAge(patient.birthDate) <= 10 || patient.gender === "female"',
};

export const mchSummaryDashboardMeta = {
  name: 'mch-summary',
  slot: 'mch-summary-slot',
  columns: 1,
  title: 'MNCH Summary',
  path: 'mnch-summary',
  layoutMode: 'anchored',
};

export const maternalVisitsDashboardMeta = {
  slot: 'maternal-visits-summary-slot',
  columns: 1,
  title: 'Maternal Visits',
  path: 'maternal-visits',
  layoutMode: 'anchored',
  patientExpression: 'calculateAge(patient.birthDate) > 10',
};

export const childVisitsDashboardMeta = {
  slot: 'child-visits-summary-slot',
  columns: 1,
  title: 'Child Visits',
  path: 'child-visits',
  layoutMode: 'anchored',
  patientExpression: 'calculateAge(patient.birthDate) <= 10',
};

// Clinical Dashboard
export const motherChildDashboardMeta = {
  name: 'mother-child-health',
  slot: 'mother-child-health-dashboard-slot',
  config: {
    columns: 1,
    type: 'grid',
    programme: 'pmtct',
    dashboardTitle: 'Mother Child Health Home Page',
    icon: '',
  },
  isLink: true,
  title: 'Maternal & Child Health',
};
