import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  facilityDashboardAboveSiteUrl: {
    _type: Type.String,
    _description: 'Facility dashboard link for superset analytics',
    _default: 'https://odoosuperset.kenyahmis.org/superset/dashboard/11/',
  },
  showAirAndReportLinks: {
    _type: Type.Boolean,
    _description: 'Show Air and Report links on facility dashboard',
    _default: false,
  },
};

export type FacilityDashboardConfigObject = {
  facilityDashboardAboveSiteUrl: string;
  showAirAndReportLinks: boolean;
};
