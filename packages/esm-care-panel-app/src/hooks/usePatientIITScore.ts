import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { IITRiskScore } from '../types';

const usePatientIITScore = (patientUuid: string) => {
  const url = `${restBaseUrl}/keml/patientiitscore?patientUuid=${patientUuid}`;
  const { data, error, isLoading } = useSWR<FetchResponse<IITRiskScore>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    riskScore: data?.data ?? {
      riskScore: 'High',
      evaluationDate: '2023-07-01',
      description: 'Risk of heart disease based on various factors.',
      riskFactors: 'High cholesterol, Smoking, Lack of exercise, Poor diet',
    },
  };
};

export default usePatientIITScore;
