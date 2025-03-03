import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  facilityDashboardAboveSiteUrl: {
    _type: Type.String,
    _description: 'Facility dashboard link for superset analytics',
    // links for testing above site superset dashbord embeding
    // _default: 'https://odoosuperset.kenyahmis.org/superset/dashboard/11/', // Actual facility link
    _default: 'https://superset.datatest.ch/superset/dashboard/10/', // Public accessible test link
    // _default: 'http://192.168.1.102:8088/superset/dashboard/1/', // Local test instance link
  },
};

export type FacilityDashboardConfigObject = {
  facilityDashboardAboveSiteUrl: string;
};
