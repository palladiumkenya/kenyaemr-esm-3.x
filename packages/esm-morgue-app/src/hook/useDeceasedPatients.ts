import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { PaginatedResponse } from '../types';
export async function fetchDeceasedPatient(query: string, abortController: AbortController) {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true&name=${query}`;

  const resp = await openmrsFetch<{ results: Array<PaginatedResponse> }>(url, {
    signal: abortController.signal,
  });
  return resp?.data?.results;
}
