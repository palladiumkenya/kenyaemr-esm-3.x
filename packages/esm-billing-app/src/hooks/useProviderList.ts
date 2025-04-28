import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import React from 'react';
import useSWR from 'swr';
import { Provider } from '../types';

const useProviderList = () => {
  const customPresentation = 'custom:(uuid,display,links)';
  const url = `${restBaseUrl}/provider?v=${customPresentation}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Provider> } }>(url, openmrsFetch);

  return {
    providers: data?.data?.results ?? [],
    error,
    providersLoading: isLoading,
  };
};

export default useProviderList;
