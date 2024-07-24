import { restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { labManifestSamples } from '../lab-manifest.mock';
import { LabManifestSample } from '../types';

const mockeFetch = async (url: string) => {
  return await new Promise<Array<LabManifestSample>>((resolve, _) => {
    setTimeout(() => {
      resolve(labManifestSamples);
    }, 3000);
  });
};

const useLabManifestSamples = (manifestUuid: string) => {
  const url = `${restBaseUrl}/lab-manifest/${manifestUuid}/samples`;
  const { isLoading, error, data } = useSWR<Array<LabManifestSample>>(url, mockeFetch);

  return {
    isLoading,
    samples: data ?? [],
    error,
  };
};

export default useLabManifestSamples;
