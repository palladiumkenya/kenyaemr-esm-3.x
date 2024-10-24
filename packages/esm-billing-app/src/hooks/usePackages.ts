import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Package, SHAPackage } from '../types';

/**
 * Hook that return a list of sha benefits category/packages
 * @returns
 */
const usePackages = () => {
  const url = `https://payers.apeiro-digital.com/api/master/category/all`;

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
