import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  facilityDashboardAboveSiteUrl: {
    _type: Type.String,
    _description: 'Facility dashboard link for superset analytics',
    _default: 'https://odoosuperset.kenyahmis.org/superset/dashboard/11/',
  },
};

export type FacilityDashboardConfigObject = {
  facilityDashboardAboveSiteUrl: string;
};
