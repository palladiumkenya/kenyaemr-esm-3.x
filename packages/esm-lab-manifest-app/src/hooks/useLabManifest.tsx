import { restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { labManifest } from '../lab-manifest.mock';
import { LabManifest } from '../types';

const mockeFetch = async (url: string) => {
  const uuid = url.split('/').at(-1);
  return await new Promise<LabManifest>((resolve, _) => {
    setTimeout(() => {
      resolve(labManifest.find((mn) => mn.uuid === uuid));
    }, 3000);
  });
};

const useLabManifest = (manifestUuid: string) => {
  const url = `${restBaseUrl}/lab-manifest/${manifestUuid}`;
  const { isLoading, error, data } = useSWR<LabManifest>(url, mockeFetch);

  return {
    isLoading,
    error,
    manifest: data,
  };
};

export default useLabManifest;
