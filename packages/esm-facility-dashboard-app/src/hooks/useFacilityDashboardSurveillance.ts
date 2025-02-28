import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type SurveillanceSummary } from '../types';

const useFacilityDashboardSurveillance = () => {
  const url = `${restBaseUrl}/kenyaemr/facility-dashboard`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<SurveillanceSummary>>(url, openmrsFetch);
  return {
    surveillanceSummary: data?.data,
    isLoading,
    mutate,
    error,
  };
};

export default useFacilityDashboardSurveillance;
