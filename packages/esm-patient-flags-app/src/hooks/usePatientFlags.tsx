import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface PatientFlagsReturnType {
  patientFlags: Array<string>;
  isLoading: boolean;
  error: Error;
}

/**
 * React hook that takes in a patient uuid and returns
 * patient flags for that patient together with helper objects
 * @param patientUuid Unique patient idenfier
 * @returns An array of patient identifiers
 */
export const usePatientFlags = (patientUuid: string): PatientFlagsReturnType => {
  const patientFlagsUrl = `/ws/rest/v1/kenyaemr/flags?patientUuid=${patientUuid}`;
  const { data, mutate, error, isLoading } = useSWR<{ data: { results: Array<string> } }>(
    patientFlagsUrl,
    openmrsFetch,
  );
  const patientFlags = typeof data?.data === 'string' ? [] : data?.data?.results ?? [];
  return { patientFlags, isLoading, error };
};
