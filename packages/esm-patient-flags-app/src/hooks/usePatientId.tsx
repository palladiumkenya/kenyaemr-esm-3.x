import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

const usePatientId = (patientUuid: string) => {
  const { isLoading, data, error } = useSWR<{ data: { patientId: string; age: number } }>(
    `/ws/rest/v1/kenyaemr/patient?patientUuid=${patientUuid}`,
    openmrsFetch,
  );
  return { patient: data?.data, error, isLoading };
};

export default usePatientId;
