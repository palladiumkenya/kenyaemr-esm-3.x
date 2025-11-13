import { openmrsFetch, Patient, restBaseUrl } from '@openmrs/esm-framework';

export async function fetchPerson(query: string, abortController: AbortController) {
  const customREp = 'custom:(uuid,identifiers,person:(uuid,display,gender,age,birthdate,attributes))';
  const patientsRes = await openmrsFetch<{ results: Array<Patient> }>(
    `${restBaseUrl}/patient?q=${query}&v=${customREp}`,
    {
      signal: abortController.signal,
    },
  );
  return patientsRes?.data?.results ?? [];
}

export const searchPatient = async (query: string) => {
  const abortController = new AbortController();
  return await fetchPerson(query, abortController);
};
