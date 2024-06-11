import useSWR from 'swr';
import { OpenmrsResource, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { CodedProvider, CodedCondition, ProcedurePayload } from '../../types';

type Provider = {
  uuid: string;
  display: string;
  person: OpenmrsResource;
};

export const useProviders = () => {
  const url = `${restBaseUrl}/provider?v=custom:(uuid,display,person:(uuid,display))`;
  const { data, error, isLoading } = useSWR<{
    data: { results: Array<Provider> };
  }>(url, openmrsFetch);

  return {
    providers: data?.data.results ?? [],
    isLoadingProviders: isLoading,
    loadingProvidersError: error,
  };
};

export const savePostProcedure = async (postProcedure: ProcedurePayload) => {
  const response = await openmrsFetch(`${restBaseUrl}/procedure`, {
    method: 'POST',
    body: JSON.stringify(postProcedure),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response;
};

export function useConditionsSearch(conditionToLookup: string) {
  const config = useConfig();
  const conditionConceptClassUuid = config?.conditionConceptClassUuid;
  const conditionsSearchUrl = `${restBaseUrl}/conceptsearch?conceptClasses=${conditionConceptClassUuid}&q=${conditionToLookup}`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedCondition> } }, Error>(
    conditionToLookup ? conditionsSearchUrl : null,
    openmrsFetch,
  );

  return {
    searchResults: data?.data?.results ?? [],
    error: error,
    isSearching: isLoading,
  };
}

export function useProvidersSearch(providerToLookup: string) {
  const providerSearchUrl = `${restBaseUrl}/provider?v=custom:(uuid,display,person:(uuid,display))&q=${providerToLookup}`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedProvider> } }, Error>(
    providerToLookup ? providerSearchUrl : null,
    openmrsFetch,
  );

  return {
    providerSearchResults: data?.data?.results ?? [],
    error: error,
    isProviderSearching: isLoading,
  };
}
