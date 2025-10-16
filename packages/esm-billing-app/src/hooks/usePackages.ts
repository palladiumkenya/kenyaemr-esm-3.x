import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Package } from '../types';

interface PackagesFilter {
  applicable_gender?: 'male' | 'female';
}

/**
 * Hook that returns a list of SHA benefits category/packages
 * @param filters - Optional filters for packages
 * @returns
 */
const usePackages = (filters?: PackagesFilter) => {
  const params = new URLSearchParams();

  if (filters?.applicable_gender) {
    params.append('applicable_gender', filters.applicable_gender);
  }

  const url = `${restBaseUrl}/insclaims/packages?${params.toString()}`;

  const { data, isLoading, error } = useSWR<
    FetchResponse<{ result: Array<{ benefitCode: string; benefitName: string; description?: string }> }>
  >(url, openmrsFetch);

  return {
    isLoading,
    packages: (data?.data.result ?? []).map(
      (category) =>
        ({
          uuid: `${category.benefitCode}`,
          packageCode: category.benefitCode,
          packageName: category.benefitName,
        } as Package),
    ),
    error,
  };
};

export default usePackages;
