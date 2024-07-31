import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { extractLabManifest } from '../lab-manifest.resources';
import { LabManifest } from '../types';

const useLabManifests = (status: string) => {
  const url = `${restBaseUrl}/labmanifest?v=full&status=${status}`;
  const { isLoading, error, data } = useSWR<FetchResponse<{ results: Array<LabManifest> }>>(url, openmrsFetch);

  return {
    isLoading,
    manifests: (data?.data?.results ?? []).map(extractLabManifest),
    error,
  };
};

export default useLabManifests;
