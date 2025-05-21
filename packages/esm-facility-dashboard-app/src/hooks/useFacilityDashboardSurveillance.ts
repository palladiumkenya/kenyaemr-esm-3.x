import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { HivPositiveNotLinked, IndicationMode, type SurveillanceSummary } from '../types';
import { useMemo } from 'react';
import { formattedDate, sevenDaysAgo, today } from '../constants';

/**
 * Handling null/undefined/zero values
 */
const safeCalculatePercentage = (numerator: number, denominator: number): number | null => {
  if (!numerator || !denominator || denominator === 0) {
    return null;
  }
  return parseFloat(((numerator / denominator) * 100).toFixed(2));
};

const useFacilityDashboardSurveillance = (startDate?: Date, endDate?: Date) => {
  const { formattedStartDate, formattedEndDate, url } = useMemo(() => {
    const formattedStartDate = startDate ? formattedDate(startDate) : formattedDate(sevenDaysAgo());
    const formattedEndDate = endDate ? formattedDate(endDate) : formattedDate(today());

    const url = `${restBaseUrl}/kenyaemr/facility-dashboard?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

    return { formattedStartDate, formattedEndDate, url };
  }, [startDate, endDate]);

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<SurveillanceSummary>>(url, openmrsFetch);

  const calculations = useMemo(() => {
    const getIndication = (indicator: number, denominator: number, threshold: number): IndicationMode => {
      if (denominator === 0 || indicator <= denominator * threshold) {
        return 'decreasing';
      }
      return 'increasing';
    };

    const getPercentage = (indicator: number, denominator: number): string => {
      const result = safeCalculatePercentage(indicator, denominator);
      if (result === null) {
        return indicator === null || indicator === undefined ? '- %' : '0 %';
      }
      return `${result} %`;
    };

    const getCompletedPercentage = (indicator: number, denominator: number): number | null => {
      if (!denominator) {
        return null;
      }
      return safeCalculatePercentage(denominator - indicator, denominator);
    };

    const getPendingPercentage = (indicator: number, denominator: number): number | null => {
      return safeCalculatePercentage(indicator, denominator);
    };

    const getThirtydaysRunninPercentage = (
      denominator: Array<HivPositiveNotLinked>,
      numerator: Array<HivPositiveNotLinked>,
    ) => {
      if (!denominator?.length) {
        return [];
      }

      const result: Array<HivPositiveNotLinked> = new Array(denominator.length * 2);
      let index = 0;

      const numeratorMap = new Map(numerator.map((item) => [item.day, item.value]));

      for (const denomItem of denominator) {
        const numValue = numeratorMap.get(denomItem.day) ?? 0;
        const denomValue = denomItem.value;

        const completedPct = denomValue > 0 ? parseFloat((((denomValue - numValue) / denomValue) * 100).toFixed(2)) : 0;
        const pendingPct = denomValue > 0 ? parseFloat(((numValue / denomValue) * 100).toFixed(2)) : 0;

        result[index++] = { day: denomItem.day, group: 'Completed', value: completedPct };
        result[index++] = { day: denomItem.day, group: 'Pending', value: pendingPct };
      }

      return result;
    };

    const getThirtydaysRunninPendingPercentage = (
      denominator: Array<HivPositiveNotLinked>,
      numerator: Array<HivPositiveNotLinked>,
    ) => {
      if (!denominator?.length) {
        return [];
      }

      const result: Array<HivPositiveNotLinked> = new Array(denominator.length);

      const numeratorMap = new Map(numerator.map((item) => [item.day, item.value]));

      return denominator.map((denomItem) => {
        const numValue = numeratorMap.get(denomItem.day) ?? 0;
        const denomValue = denomItem.value;
        const pendingPct = denomValue > 0 ? parseFloat(((numValue / denomValue) * 100).toFixed(2)) : 0;

        return { day: denomItem.day, group: 'Pending', value: pendingPct };
      });
    };

    return {
      getIndication,
      getPercentage,
      getCompletedPercentage,
      getPendingPercentage,
      getThirtydaysRunninPercentage,
      getThirtydaysRunninPendingPercentage,
    };
  }, []);

  return {
    surveillanceSummary: data?.data ?? null,
    isLoading,
    mutate,
    error,
    ...calculations,
  };
};

export default useFacilityDashboardSurveillance;
