import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const usePatientId = (patientUuid: string) => {
  const { isLoading, data, error } = useSWR<{ data: { results: { patientId: string; age: number } } }>(
    `/ws/rest/v1/kenyaemr/patient?patientUuid=${patientUuid}`,
    openmrsFetch,
  );
  return { patient: data?.data?.results, error, isLoading };
};
