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

  const { data, isLoading, error } = useSWR<FetchResponse<Array<{ code: string; name: string; description?: string }>>>(
    url,
    openmrsFetch,
  );

  const packages = (data?.data ?? []).map((category) => {
    const pkg = {
      uuid: `${category.code}`,
      packageCode: category.code,
      packageName: category.name,
    } as Package;
    return pkg;
  });

  return {
    isLoading,
    packages,
    error,
  };
};

export default usePackages;
