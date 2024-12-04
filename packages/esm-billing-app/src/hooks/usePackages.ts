import { FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../config-schema';
import { Package } from '../types';
import { category } from './benefits.mock';

/**
 * Hook that return a list of sha benefits category/packages
 * @returns
 */
const usePackages = () => {
  const { hieBaseUrl } = useConfig<BillingConfig>();
  const url = `${hieBaseUrl}/master/category/all-`;

  const { data, isLoading, error } = useSWR<Array<{ id: number; code: string; categoryName: string }>>(
    url,
    async () => {
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 2000);
      });
      return category;
    },
  );

  return {
    isLoading,
    packages: (data ?? []).map(
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
