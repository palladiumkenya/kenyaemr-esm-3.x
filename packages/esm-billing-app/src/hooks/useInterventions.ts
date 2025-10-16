import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface InterventionsFilter {
  package_code?: string;
  applicable_gender?: 'MALE' | 'FEMALE';
}

interface Intervention {
  interventionCode: string;
  interventionName: string;
  interventionPackage: string;
  interventionSubPackage: string;
  interventionDescription?: string;
  insuranceSchemes?: string;
}

/**
 * Hook that returns a list of interventions based on filters
 * @param filters - Filters for interventions (package_code, applicable_gender)
 * @returns
 */
export const useInterventions = (filters?: InterventionsFilter) => {
  const params = new URLSearchParams();

  if (filters?.package_code) {
    params.append('package_code', filters.package_code);
  }

  if (filters?.applicable_gender) {
    params.append('applicable_gender', filters.applicable_gender.toLowerCase());
  }

  const url = `${restBaseUrl}/insclaims/interventions?${params.toString()}`;

  const allInterventionsUrl = `${restBaseUrl}/insclaims/interventions`;

  const { data, isLoading, error } = useSWR<FetchResponse<{ data: Array<Intervention> }>>(url, openmrsFetch);

  const { data: allData } = useSWR<FetchResponse<{ data: Array<Intervention> }>>(allInterventionsUrl, openmrsFetch);

  const interventions = data?.data?.data ?? [];
  const allInterventions = allData?.data?.data ?? [];
  return {
    isLoading,
    interventions,
    allInterventions,
    error,
  };
};
