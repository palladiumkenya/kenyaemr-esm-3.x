import { restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { activeRequests } from '../lab-manifest.mock';
import { ActiveRequests } from '../types';

const mockeFetch = async (url: string) => {
  const status = url.split('=').at(-1);
  return await new Promise<Array<ActiveRequests>>((resolve, _) => {
    setTimeout(() => {
      resolve(activeRequests);
    }, 3000);
  });
};

const useActiveRequests = () => {
  const url = `${restBaseUrl}/active-request`;
  const { isLoading, error, data } = useSWR<Array<ActiveRequests>>(url, mockeFetch);

  return {
    isLoading,
    requests: data ?? [],
    error,
  };
};

export default useActiveRequests;
