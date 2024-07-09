import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { IITRiskScore } from '../types';

const usePatientIITScore = (patientUuid: string) => {
  const url = `${restBaseUrl}/keml/patientiitscore?patientUuid=${patientUuid}`;
  const { data, error, isLoading } = useSWR<FetchResponse<IITRiskScore>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    riskScore: data?.data,
  };
};

export default usePatientIITScore;
