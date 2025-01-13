import { restBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { ETLResponse } from '../../types';

export const recreateTables = async () => {
  const url = `${restBaseUrl}/kemrchart/recreateTables`;
  const response = await openmrsFetch<{
    data: Array<ETLResponse>;
  }>(url);
  return response.data.data;
};

export const refreshTables = async () => {
  const url = `${restBaseUrl}/kemrchart/refreshTables`;
  const response = await openmrsFetch<{
    data: Array<ETLResponse>;
  }>(url);
  return response.data.data;
};

export const recreateDatatools = async () => {
  const url = `${restBaseUrl}/kemrchart/recreateDatatoolsTables`;
  const response = await openmrsFetch<{
    data: Array<ETLResponse>;
  }>(url);
  return response.data.data;
};

export const refreshDwapi = async () => {
  const url = `${restBaseUrl}/kemrchart/recreateDwapiTables`;
  const response = await openmrsFetch<{
    data: Array<ETLResponse>;
  }>(url);
  return response.data.data;
};
export const recreateFacilityWideTables = async () => {
  const url = `${restBaseUrl}/kemrchart/recreateFacilitywideTables`;
  const response = await openmrsFetch<{
    data: Array<ETLResponse>;
  }>(url);
  return response.data.data;
};
