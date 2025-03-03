import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { IndicationMode, type SurveillanceSummary } from '../types';
import { useCallback } from 'react';

const useFacilityDashboardSurveillance = () => {
  const url = `${restBaseUrl}/kenyaemr/facility-dashboard`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<SurveillanceSummary>>(url, openmrsFetch);
  const getIndication = useCallback((indicator: number, denominator: number, threshold: number): IndicationMode => {
    if (denominator === 0) {
      return 'decreasing';
    }
    if (indicator > denominator * threshold) {
      return 'increasing';
    } else {
      return 'decreasing';
    }
  }, []);

  return {
    surveillanceSummary: data?.data,
    getIndication,
    isLoading,
    mutate,
    error,
  };
};

export default useFacilityDashboardSurveillance;
