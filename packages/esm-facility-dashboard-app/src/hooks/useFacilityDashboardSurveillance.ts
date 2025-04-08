import { FetchResponse, formatDatetime, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { IndicationMode, type SurveillanceSummary } from '../types';
import { useCallback } from 'react';
import { formattedDate, sevenDaysAgo, today } from '../constants';

const useFacilityDashboardSurveillance = (startDate?: Date, endDate?: Date) => {
  const url =
    startDate && endDate
      ? `${restBaseUrl}/kenyaemr/facility-dashboard?startDate=${formattedDate(startDate)}&endDate=${formattedDate(
          endDate,
        )}`
      : `${restBaseUrl}/kenyaemr/facility-dashboard?startDate=${formattedDate(today())}&endDate=${formattedDate(
          sevenDaysAgo(),
        )}`;

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<SurveillanceSummary>>(url, openmrsFetch);
  const getIndication = useCallback((indicator: number, denominator: number, threshold: number): IndicationMode => {
    if (denominator === 0 || indicator <= denominator * threshold) {
      return 'decreasing';
    }
    return 'increasing';
  }, []);
  const getPercentage = useCallback((indicator: number, denominator: number): string => {
    if (indicator === null || indicator === undefined || denominator === null || denominator === undefined) {
      return `- %`;
    }
    if (denominator === 0) {
      return '0 %';
    }
    const percent = (indicator / denominator) * 100;
    return `${percent.toFixed(2)} %`;
  }, []);

  return {
    surveillanceSummary: data?.data ?? null,
    getIndication,
    getPercentage,
    isLoading,
    mutate,
    error,
  };
};

export default useFacilityDashboardSurveillance;
