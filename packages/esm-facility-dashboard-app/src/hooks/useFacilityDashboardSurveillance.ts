import { FetchResponse, formatDatetime, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { IndicationMode, type SurveillanceSummary } from '../types';
import { useCallback, useMemo } from 'react';
import { formattedDate, sevenDaysAgo, today } from '../constants';

const useFacilityDashboardSurveillance = (startDate?: Date, endDate?: Date) => {
  const defaultStartDate = useMemo(() => formattedDate(sevenDaysAgo()), []);
  const defaultEndDate = useMemo(() => formattedDate(today()), []);

  const url = useMemo(() => {
    const start = startDate ? formattedDate(startDate) : defaultStartDate;
    const end = endDate ? formattedDate(endDate) : defaultEndDate;
    return `${restBaseUrl}/kenyaemr/facility-dashboard?startDate=${start}&endDate=${end}`;
  }, [startDate, endDate, defaultStartDate, defaultEndDate]);

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<SurveillanceSummary>>(url, openmrsFetch);

  const calculatePercentage = useCallback((numerator: number, denominator: number): number | null => {
    if (
      numerator === null ||
      numerator === undefined ||
      denominator === null ||
      denominator === undefined ||
      denominator === 0
    ) {
      return null;
    }
    return parseFloat(((numerator / denominator) * 100).toFixed(2));
  }, []);

  const getIndication = useCallback((indicator: number, denominator: number, threshold: number): IndicationMode => {
    if (denominator === 0 || indicator <= denominator * threshold) {
      return 'decreasing';
    }
    return 'increasing';
  }, []);

  const getPercentage = useCallback(
    (indicator: number, denominator: number): string => {
      const result = calculatePercentage(indicator, denominator);
      if (result === null) {
        return indicator === null || indicator === undefined || denominator === null || denominator === undefined
          ? '- %'
          : '0 %';
      }
      return `${result} %`;
    },
    [calculatePercentage],
  );

  const getCompletedPercentage = useCallback(
    (indicator: number, denominator: number): number | null => {
      if (
        indicator === null ||
        indicator === undefined ||
        denominator === null ||
        denominator === undefined ||
        denominator === 0
      ) {
        return null;
      }
      return calculatePercentage(denominator - indicator, denominator);
    },
    [calculatePercentage],
  );

  const getPendingPercentage = useCallback(
    (indicator: number, denominator: number): number | null => {
      return calculatePercentage(indicator, denominator);
    },
    [calculatePercentage],
  );

  return {
    surveillanceSummary: data?.data ?? null,
    getIndication,
    getPercentage,
    isLoading,
    mutate,
    error,
    getCompletedPercentage,
    getPendingPercentage,
  };
};

export default useFacilityDashboardSurveillance;
