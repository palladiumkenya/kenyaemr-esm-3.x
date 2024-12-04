import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { IITRiskScore } from '../types';
import { patientRiskScore } from '../iit-risk-score/risk-score.mock';
import { useMemo } from 'react';

const usePatientIITScore = (patientUuid: string) => {
  const url = `${restBaseUrl}/keml/patientiitscore?patientUuid=${patientUuid}`;
  const { data, error, isLoading } = useSWR<FetchResponse<IITRiskScore>>(url, openmrsFetch);

  const riskScore = useMemo(() => data?.data, [data]);
  return {
    isLoading,
    error,
    riskScore,
  };
};

export default usePatientIITScore;
