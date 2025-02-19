import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { SHAIntervention } from '../types';
import useFacilityLevel from './useFacilityLevel';
import { useMemo } from 'react';

export type InterventionsFilter = {
  package_code?: string;
  scheme_code?: string;
  applicable_gender?: 'MALE' | 'FEMALE';
};

export const toQueryParams = (q: Record<string, any>) => {
  return (
    '?' +
    Object.entries(q)
      .reduce((prev, [key, val]) => {
        if (val !== undefined && val !== null) {
          return [...prev, `${key}=${val}`];
        }
        return prev;
      }, [])
      .join('&')
  );
};

type Data = {
  status: string;
  data: Array<{
    interventionName: string;
    interventionCode: string;
    interventionPackage: string;
    interventionSubPackage: string;
    interventionDescription?: string;
    insuranceSchemes: Array<{
      rules: Array<{
        ruleName: string;
        ruleCode: string;
        value: string;
      }>;
    }>;
  }>;
};
export const useInterventions = (filters: InterventionsFilter) => {
  const fetcher = (url: string) => {
    return openmrsFetch(url, {
      method: 'POST',
      body: {
        searchKeyAndValues: {
          ...filters,
          // scheme_code: 'UHC',
          applicable_gender: filters.applicable_gender ? `ALL,${filters.applicable_gender}` : undefined,
        },
      },
    });
  };

  const { error: facilityLevelError, isLoading: isLoadingFacilityLevel, level } = useFacilityLevel();

  const url = `${restBaseUrl}/kenyaemr/sha-interventions${toQueryParams({
    ...filters,
    synchronize: false,
  })}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Data>>(url, openmrsFetch);
  const interventions = useMemo(() => {
    return data?.data?.data
      ?.filter((d) => {
        // 1. Filter by package code (only if defined)
        if (filters.package_code && d.interventionPackage !== filters.package_code) {
          return false;
        }

        // 2. Filter by applicable gender (only if defined)
        if (
          filters.applicable_gender &&
          d.insuranceSchemes?.some((s) =>
            s.rules?.some(
              (r) =>
                r.ruleCode === 'applicable_gender' &&
                r.value && // Ensure value exists
                !['ALL', filters.applicable_gender].includes(r.value),
            ),
          )
        ) {
          return false;
        }

        // 3. Filter by levels applicable (only if level is defined)
        if (
          level &&
          d.insuranceSchemes?.some((s) =>
            s.rules?.some(
              (r) =>
                r.ruleCode === 'levels_applicable' &&
                r.value && // Ensure value exists
                !String(r.value).includes(level), // Convert to string to avoid array issues
            ),
          )
        ) {
          return false;
        }

        return true; // Keep item if it passes all filters
      })
      ?.map(({ interventionCode, interventionName, interventionPackage, interventionSubPackage }) => ({
        interventionCode,
        subCategoryBenefitsPackage: interventionSubPackage,
        interventionName,
      })) as SHAIntervention[];
  }, [data, filters, level]); // Ensure proper memoization

  return {
    isLoading: isLoading || isLoadingFacilityLevel,
    interventions,
    error: error || facilityLevelError,
  };
};
