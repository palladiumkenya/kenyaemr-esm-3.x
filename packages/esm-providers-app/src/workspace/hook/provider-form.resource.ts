import { FetchResponse, makeUrl, openmrsFetch, OpenmrsResource, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR, { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { ConfigObject } from '../../config-schema';
import { FacilityResponse, Provider, ProviderResponse, RolesResponse, User } from '../../types';
import { HWR_API_NO_CREDENTIALS, PROVIDER_NOT_FOUND, RESOURCE_NOT_FOUND, UNKNOWN } from '../../constants';

export const useIdentifierTypes = () => {
  const { isLoading, data, error } = useSWRImmutable<{ data: { results: Array<OpenmrsResource> } }>(
    `${restBaseUrl}/patientidentifiertype`,
    openmrsFetch,
  );
  const { nationalIDUuid, passportNumberUuid } = useConfig<ConfigObject>();

  const allowedUuids = [nationalIDUuid, passportNumberUuid];

  const filteredIdentifierTypes =
    data?.data.results.filter((identifier) => allowedUuids.includes(identifier.uuid)) ?? [];

  return {
    providerIdentifierTypes: filteredIdentifierTypes,
    isLoading,
    error,
    mutate,
  };
};

export const useRoles = () => {
  const customRepresentation = 'custom:(uuid,display,privileges:(uuid,display,description))';
  const url = `${restBaseUrl}/role?v=${customRepresentation}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: RolesResponse }>(url, openmrsFetch);
  const roles = data?.data?.results || [];
  return { roles, error, isLoading, mutate };
};

export const useFacility = (searchTerm: string) => {
  const customRepresentation = 'custom:(uuid,name,attributes:(value))';
  const url = `${restBaseUrl}/location?v=${customRepresentation}&q=${searchTerm}&limit=15`;
  const { data, error, isLoading } = useSWRImmutable<{ data: FacilityResponse }>(searchTerm ? url : null, openmrsFetch);

  return { data: data?.data?.results, error, isLoading, mutate };
};

const convertToIdenitifertype = (identifierType) => {
  return identifierType.toLowerCase().replace(/\s+/g, '-');
};
export const searchHealthCareWork = async (identifierType: string, identifierNumber: string) => {
  const url = `${restBaseUrl}/kenyaemr/practitionersearch?identifierType=${identifierType}&identifierNumber=${identifierNumber}`;
  // Not using openmrsfetch to avoid automatic ending of current session due to 401(Unauthorized) status error it throws
  const response = await fetch(makeUrl(url));
  if (response.ok) {
    const responseData = await response.json();
    if (responseData?.issue) {
      throw new Error(PROVIDER_NOT_FOUND);
    }
    return responseData;
  }
  if (response.status === 401) {
    throw new Error(HWR_API_NO_CREDENTIALS);
  } else if (response.status === 404) {
    throw new Error(RESOURCE_NOT_FOUND);
  }
  throw new Error(UNKNOWN);
};
export const createProvider = (payload) => {
  const url = `${restBaseUrl}/provider`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
export const createUser = (payload) => {
  const url = `${restBaseUrl}/user?v=custom:(person:(uuid,display,gender,attributes:(uuid,display)))`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const useProviderDetails = (providerUuid: string) => {
  const url = `${restBaseUrl}/provider/${providerUuid}?v=full`;
  const { data, error, isLoading } = useSWR<FetchResponse<ProviderResponse>>(url, openmrsFetch);
  return { provider: data?.data, error, isLoading, mutate };
};

export const useProviderUser = (providerUuid: string) => {
  const { provider, isLoading: providerLoading, error: providerError } = useProviderDetails(providerUuid);
  const url = `${restBaseUrl}/user?q=${provider?.person?.display}&v=full`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<User> }>>(
    !providerError && !providerLoading ? url : null,
    openmrsFetch,
  );
  return {
    user: (data?.data?.results ?? []).find((_user) => _user.person.uuid === provider?.person?.uuid),
    error: error || providerError,
    isLoading: isLoading || providerLoading,
    mutate,
  };
};

export const usePersonDetails = (providerUuid: string) => {
  const url = `${restBaseUrl}/person/${providerUuid}?v=full`;
  const { data, error, isLoading } = useSWR<FetchResponse>(url, openmrsFetch);
  const currentPerson = data?.data || [];
  return { currentPerson, error, isLoading, mutate };
};
export const updateProviderUser = (payload, userUuid: string) => {
  const url = `${restBaseUrl}/user/${userUuid}?v=full`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
export const updateProviderPerson = (payload, personUuid: string) => {
  const url = `${restBaseUrl}/person/${personUuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
export const updateProvider = (payload, providerUuid: string) => {
  const url = `${restBaseUrl}/provider/${providerUuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateProviderAttributes = (payload, providerUuid: string, attributeUuid: string) => {
  const url = `${restBaseUrl}/provider/${providerUuid}/attribute/${attributeUuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createProviderAttribute = (payload, providerUuid: string) => {
  const url = `${restBaseUrl}/provider/${providerUuid}/attribute`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
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
