import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { SHAIntervention } from '../types';

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

  const url = `${restBaseUrl}/insuranceclaims/claims/interventions/query${toQueryParams(filters)}`;
  const { isLoading, error, data } = useSWR<
    FetchResponse<{
      status: string;
      data: Array<{
        interventionName: string;
        interventionCode: string;
        interventionPackage: string;
        interventionSubPackage: string;
        interventionDescription?: string;
      }>;
    }>
  >(url, fetcher);
  return {
    isLoading,
    interventions: (data?.data?.data ?? []).map(
      ({ interventionCode, interventionName, interventionPackage, interventionSubPackage, interventionDescription }) =>
        ({
          interventionCode,
          subCategoryBenefitsPackage: interventionSubPackage,
          interventionName,
        } as SHAIntervention),
    ),
    error,
  };
};
