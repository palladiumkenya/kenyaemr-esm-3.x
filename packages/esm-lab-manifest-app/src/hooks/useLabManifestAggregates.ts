import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR, { useSWRConfig } from 'swr';
import { extractLabManifest, LabManifestFilters } from '../lab-manifest.resources';
import { LabManifest } from '../types';

const useLabManifestAggregates = (statuses: Array<string>) => {
  const statuses_ = statuses.map((status) => LabManifestFilters.find((s) => s.value === status)?.params);
  const { cache } = useSWRConfig();

  const { data, error, isValidating } = useSWR(
    statuses.length ? `${restBaseUrl}/labmanifest-aggregate-${statuses.join(',')}` : null,
    async () => {
      const results = await Promise.all(
        statuses_.map(async (status) => {
          const url = `${restBaseUrl}/labmanifest?v=full&status=${status}`;

          // Check if data already fetched by hook useLabManifests
          let data = (await cache.get(url)?.data?.json())?.results;
          if (data) {
            return data;
          }
          const response = await openmrsFetch<{ results: Array<LabManifest> }>(url);
          data = response?.data?.results.map(extractLabManifest);
          /*
          // // if not yet fetched
          // // 1. Set to loading
          try {
            cache.set(url, { isLoading: true, isValidating: true });
            const response = await openmrsFetch<{ results: Array<LabManifest> }>(url);
            // Cache the response to be found by hook useLabManifests
            cache.set(url, { isLoading: false, data: response, isValidating: true });
            data = response?.data?.results.map(extractLabManifest);
          } catch (e) {
            // If error occuse, set to the cash
            cache.set(url, { isLoading: false, error: e, isValidating: true });
          }
          */

          return data;
        }),
      );
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
