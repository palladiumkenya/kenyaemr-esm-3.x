import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Package } from '../types';

/**
 * Hook that return a list of sha benefits category/packages
 * @returns
 */
const usePackages = () => {
  const url = `${restBaseUrl}/kenyaemr/sha-benefits-package?synchronize=false`;

  const { data, isLoading, error } = useSWR<
    FetchResponse<{ data: Array<{ code: string; name: string; description?: string }> }>
  >(url, openmrsFetch);

  return {
    isLoading,
    packages: (data?.data.data ?? []).map(
      (category) =>
        ({
          uuid: `${category.code}`,
          packageCode: category.code,
          packageName: category.name,
        } as Package),
    ),
    error,
  };
};

export default usePackages;
