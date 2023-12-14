import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  facilityDashboardUrl: {
    _type: Type.String,
    _description: 'Facility dashboard link for superset analytics',
    _default:
      'http://localhost:8088/superset/dashboard/11/?native_filters_key=qyGypN3sBN9g7IYbvZJc51SXLyEYcONEZ3lpUuILe_22hewewKf4U_jNHRVwg9y2',
  },
};

export type ConfigObject = {
  facilityDashboardUrl: string;
};
