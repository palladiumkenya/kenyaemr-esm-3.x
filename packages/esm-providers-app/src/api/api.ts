import useSWR from 'swr';
import { Buffer } from 'buffer';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';

const providerUrl = `${restBaseUrl}/provider?v=full`
export const custom =
  '/ws/rest/v1/provider?&v=custom:(uuid,identifier,display,person:(uuid,display),attributes:(uuid,display),retired)';

const fetcher = async (url) => {
  try {
    const response = await openmrsFetch(url, {});
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`An error occurred while fetching data: ${error.message}`);
  }
};

export const getAllProviders = () => {
  const { data, isLoading, error, isValidating } = useSWR(`${custom}`, fetcher);

  const response = data ? (data as any)?.results : [];

  return {
    response,
    isLoading,
    error,
    isValidating,
  };
};

export const searchUsers = async (name: string, ac = new AbortController()) => {
  const results = await openmrsFetch(`ws/rest/v1/user?q=${name}&v=custom:(uuid,display,person)`, {
    signal: ac.signal,
  });
  return results.data.results;
};
