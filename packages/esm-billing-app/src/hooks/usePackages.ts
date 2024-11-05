import { FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../config-schema';
import { Package } from '../types';

/**
 * Hook that return a list of sha benefits category/packages
 * @returns
 */
const usePackages = () => {
  const { hieBaseUrl } = useConfig<BillingConfig>();
  const url = `${hieBaseUrl}/master/category/all-`;

  const { data, isLoading, error } = useSWR<FetchResponse<Array<{ id: number; code: string; categoryName: string }>>>(
    url,
    openmrsFetch,
  );

  return {
    isLoading,
    packages: (data?.data ?? []).map(
      (category) =>
        ({
          uuid: `${category.id}`,
          packageCode: category.code,
          packageName: category.categoryName,
        } as Package),
    ),
    error,
  };
};

export default usePackages;
