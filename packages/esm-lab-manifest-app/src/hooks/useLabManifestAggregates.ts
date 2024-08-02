import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { extractLabManifest } from '../lab-manifest.resources';
import { LabManifest } from '../types';
const fetchLabManifestsByStatus = async (status: string) => {
  const url = `${restBaseUrl}/labmanifest?v=full&status=${status}`;
  const response = await openmrsFetch<{ results: Array<LabManifest> }>(url);
  return response?.data?.results.map(extractLabManifest);
};

// TODO -> oPTIOMOZE BY CACHING AND RETREVING FROM CACHE
const useLabManifestAggregates = (statuses: Array<string>) => {
  const { data, error, isValidating } = useSWR(
    statuses.length ? `labmanifest-aggregate-${statuses.join(',')}` : null,
    async () => {
      const results = await Promise.all(statuses.map((status) => fetchLabManifestsByStatus(status)));
      return results.flat();
    },
  );

  return {
    isLoading: isValidating,
    manifests: data || [],
    error,
  };
};

export default useLabManifestAggregates;
