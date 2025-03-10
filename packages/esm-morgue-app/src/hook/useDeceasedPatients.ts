import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { MortuaryLocationFetchResponse, PaginatedResponse } from '../types';

export async function fetchDeceasedPatient(
  query: string,
  abortController: AbortController,
  admissionLocation: MortuaryLocationFetchResponse,
) {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true&name=${query}`;

  const resp = await openmrsFetch<{ results: Array<PaginatedResponse> }>(url, {
    signal: abortController.signal,
  });

  const filteredResults = resp?.data?.results.filter((patient) => {
    const isAdmitted = admissionLocation?.bedLayouts
      .map((bed) => bed.patients)
      .flat()
      .some((p) => p?.uuid === patient?.uuid);
    return !isAdmitted;
  });

  return filteredResults;
}
