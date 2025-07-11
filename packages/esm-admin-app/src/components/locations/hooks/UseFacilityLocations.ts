import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type LocationResponse } from '../types';

export const searchLocation = async (searchTerm: string) => {
  const customPresentation =
    'custom:(uuid,display,name,description,stateProvince,country,countyDistrict,address5,address6,tags,attributes:(uuid,attributeType:(uuid,display),value))';

  const url = `${restBaseUrl}/location?v=${customPresentation}&q=${searchTerm}`;

  const response = await openmrsFetch<{ results: Array<LocationResponse> }>(url);
  return response?.data?.results ?? [];
};
