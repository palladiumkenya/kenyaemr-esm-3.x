import { useMemo } from 'react';
import { SurveillanceSummary } from '../types';
import dayjs from 'dayjs';

export const useChartDomain = (
  data: Array<{ group?: string; day: string; value: number }>,
  valueKey = 'value',
  minPadding = 0,
  maxPadding = 0.1,
) => {
  return useMemo(() => {
    if (!data?.length) {
      return [0, 10];
    }

    const values = data.map((item) => item[valueKey]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values, 10);

    const paddedMin = Math.floor(minValue * (1 - minPadding));
    const paddedMax = Math.ceil(maxValue * (1 + maxPadding));

    return [paddedMin, paddedMax];
  }, [data, valueKey, minPadding, maxPadding]);
};

export const useSurveillanceData = <T extends keyof SurveillanceSummary>(
  surveillanceSummary: SurveillanceSummary | null,
  key: T,
) => {
  return useMemo(() => {
    if (!surveillanceSummary || !surveillanceSummary[key]) {
      return [];
    }

    const data = (surveillanceSummary[key] as any)?.data || [];

    return Array.isArray(data)
      ? data
          .filter((record) => record?.day)
          .sort((firstSurveillanceRecord, secondSurveillanceRecord) =>
            dayjs(firstSurveillanceRecord.day).diff(dayjs(secondSurveillanceRecord.day)),
          )
      : data;
  }, [surveillanceSummary, key]);
};
