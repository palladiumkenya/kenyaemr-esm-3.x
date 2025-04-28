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
