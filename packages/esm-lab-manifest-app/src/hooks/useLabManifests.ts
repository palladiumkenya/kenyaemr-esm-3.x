import React from 'react';
import { labManifest } from '../lab-manifest.mock';
import useSWR from 'swr';
import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { LabManifest } from '../types';

const mockeFetch = async (url: string) => {
  const status = url.split('=').at(-1);
  return await new Promise<Array<LabManifest>>((resolve, _) => {
    setTimeout(() => {
      resolve(labManifest.filter((mn) => mn.manifestStatus === status));
    }, 3000);
  });
};

const useLabManifests = (status: string) => {
  const url = `${restBaseUrl}/lab-manifest?status=${status}`;
  const { isLoading, error, data } = useSWR<Array<LabManifest>>(url, mockeFetch);
  return {
    isLoading,
    manifests: data ?? [],
    error,
  };
};

export default useLabManifests;
