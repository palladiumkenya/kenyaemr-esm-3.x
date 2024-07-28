import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { extractLabManifest } from '../lab-manifest.resources';
import { LabManifest } from '../types';

const useLabManifest = (manifestUuid: string) => {
  const url = `${restBaseUrl}/labmanifest/${manifestUuid}`;
  const { isLoading, error, data } = useSWR<FetchResponse<LabManifest>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    manifest: data?.data ? extractLabManifest(data!.data!) : undefined,
  };
};

export default useLabManifest;
