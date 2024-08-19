import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import React from 'react';
import useSWR from 'swr';
import { Provider } from '../types';

const useProvider = (uuid: string) => {
  const cutomPresentation = 'custom:(uuid,display,links)';
  const url = `${restBaseUrl}/provider/${uuid}?v=${cutomPresentation}`;

  const { data, error, isLoading } = useSWR<FetchResponse<Provider>>(url, openmrsFetch);

  return {
    provider: data?.data,
    error,
    providerLoading: isLoading,
  };
};

export default useProvider;
