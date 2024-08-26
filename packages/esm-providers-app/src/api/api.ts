import useSWR from 'swr';
import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { Provider, ProviderSession } from '../types';

const providerUrl = `${restBaseUrl}/provider`;
export const custom = `?v=custom:(uuid,identifier,display,person:(uuid,display),attributes:(uuid,display),retired)`;
export const customLicence = `?v=custom:(uuid,display,person:(uuid,display),attributes:(attributeType:ref,display,uuid,value))`;

export const UseAllProviders = () => {
  const { data, isLoading, error, isValidating } = useSWR<{ data: { results: Array<Provider> } }>(
    `${providerUrl}${custom}`,
    openmrsFetch,
  );

  return {
    providers: data?.data.results ?? [],
    isLoading,
    error,
    isValidating,
  };
};

export const searchUsers = async (name: string, ac = new AbortController()) => {
  const results = await openmrsFetch(`${restBaseUrl}/user?q=${name}&v=custom:(uuid,display,person)`, {
    signal: ac.signal,
  });
  return results.data.results;
};

export function GetProviderLicenceDate(patientId: string) {
  const url = `${providerUrl}/${patientId}${customLicence}`;

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<Provider>, Error>(
    patientId ? url : null,
    openmrsFetch,
  );

  return {
    listDetails: data?.data,
    error,
    isLoading,
    mutateListDetails: mutate,
  };
}
export function GetProviderId() {
  const url = `${restBaseUrl}/session`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<ProviderSession>, Error>(url, openmrsFetch);
  const patientUuid = data?.data?.currentProvider?.uuid;
  return {
    patientUuid,
    error,
    isLoading,
    mutate,
  };
}
