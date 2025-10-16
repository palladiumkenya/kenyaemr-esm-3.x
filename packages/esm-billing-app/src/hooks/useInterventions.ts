import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface InterventionsFilter {
  package_code?: string;
  applicable_gender?: 'MALE' | 'FEMALE';
}

interface Intervention {
  interventionCode: string;
  interventionName: string;
  description?: string;
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

  // Fetch all interventions without filters for reference
  const allInterventionsUrl = `${restBaseUrl}/insclaims/interventions`;

  const { data, isLoading, error } = useSWR<FetchResponse<{ result: Array<Intervention> }>>(url, openmrsFetch);

  const { data: allData } = useSWR<FetchResponse<{ result: Array<Intervention> }>>(allInterventionsUrl, openmrsFetch);

  return {
    isLoading,
    interventions: data?.data.result ?? [],
    allInterventions: allData?.data.result ?? [],
    error,
  };
};
