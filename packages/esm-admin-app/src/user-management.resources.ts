import { fhirBaseUrl, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR, { mutate } from 'swr';
import {
  AttributeType,
  FHIRResponse,
  PageableResult,
  Provider,
  ProviderAttributes,
  ProviderLocation,
  ProviderResponse,
  Role,
  StockOperationType,
  User,
  UserRoleScope,
} from './types';
import uniqBy from 'lodash-es/uniqBy';
import { useMemo } from 'react';

export const useUser = () => {
  const url = `${restBaseUrl}/user?v=custom:(uuid,username,display,systemId,retired,person:(uuid,display,gender,names:(givenName,familyName,middleName),attributes:(uuid,display)),roles:(uuid,description,display,name))`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<User> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    users: data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

export const postUser = async (user: Partial<User>, url: string) => {
  const response = await openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

export const createProvider = async (
  uuid: string,
  identifier: string,
  attributes: Partial<Provider>,
  providerUrl?: string,
) => {
  const providerBody = {
    person: uuid,
    identifier: identifier,
    ...attributes,
    retired: false,
  };

  return await openmrsFetch(providerUrl, {
    method: 'POST',
    body: JSON.stringify(providerBody),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createUser = async (user: Partial<User>, uuid?: string) => {
  const userUrl = uuid ? `${restBaseUrl}/user/${uuid}` : `${restBaseUrl}/user`;

  return await postUser(user, userUrl);
};

export const createOrUpdateUserRoleScope = async (
  userRoleScopeUrl?: string,
  userRoleScopePayload?: Partial<UserRoleScope>,
  userUuid?: string,
) => {
  const userRoleScopeBody = {
    userUuid: userUuid,
    ...userRoleScopePayload,
  };

  return await openmrsFetch(userRoleScopeUrl, {
    method: 'POST',
    body: JSON.stringify(userRoleScopeBody),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const handleMutation = (url: string) => {
  mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
};

export const useRoles = () => {
  const url = `${restBaseUrl}/role?v=custom:(uuid,description,display,name)`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<Role> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    roles: data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

export const usePersonAttribute = () => {
  const url = `${restBaseUrl}/personattributetype?v=custom:(name,uuid)`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<AttributeType> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    attributeTypes: data?.data?.results,
    isLoading,
    error,
  };
};

export const useProvider = (systemId: string) => {
  const url = `${restBaseUrl}/provider?q=${systemId}&v=custom:(uuid,identifier,retired,attributes:(uuid,display,value:(name),attributeType:(uuid,name)))`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<ProviderResponse> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    provider: data?.data?.results,
    loadingProvider: isLoading,
    providerError: error,
  };
};

export const useProviderAttributeType = () => {
  const url = `${restBaseUrl}/providerattributetype?v=custom:(uuid,name,display)`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<AttributeType> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    providerAttributeType: data?.data?.results,
    isLoading,
    error,
  };
};

export const useLocation = () => {
  const url = `${restBaseUrl}/location?v=custom:(uuid,name,description,retired,attributes:(value))`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<ProviderLocation> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  return {
    location: data?.data?.results,
    loadingLocation: isLoading,
    locationError: error,
  };
};

export function useStockOperationTypes() {
  const apiUrl = `${restBaseUrl}/stockmanagement/stockoperationtype?v=default`;
  const { data, isLoading, error } = useSWR<
    {
      data: PageableResult<StockOperationType>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    stockOperations: data?.data.results,
    loadingStock: isLoading,
    error,
  };
}

export function useStockTagLocations() {
  const apiUrl = `${fhirBaseUrl}/Location?_summary=data&_tag=main store,main pharmacy,dispensary `;
  const { data, error, isLoading } = useSWR<{ data: FHIRResponse }>(apiUrl, openmrsFetch);
  const stockLocations = useMemo(
    () => data?.data?.entry?.map((response) => response.resource) ?? [],
    [data?.data?.entry],
  );
  return {
    stockLocations: uniqBy(stockLocations, 'id') ?? [],
    isLoading,
    error,
  };
}

export const useUserRoleScopes = () => {
  const apiUrl = `${restBaseUrl}/stockmanagement/userrolescope?v=full`;
  const { data, error, isLoading } = useSWR<{ data: PageableResult<UserRoleScope> }, Error>(apiUrl, openmrsFetch);
  return {
    items: data?.data,
    loadingRoleScope: isLoading,
    userRoleScopeError: error,
  };
};

export function deleteUserRoleScopes(roleScopeIds: string[]) {
  let encodedRoleScopeIds = roleScopeIds.reduce((queryString, currentId, index) => {
    if (index === 0) {
      return queryString;
    }
    queryString += (queryString.length > 0 ? ',' : '') + encodeURIComponent(currentId);
    return queryString;
  }, '');

  if (encodedRoleScopeIds.length > 0) {
    encodedRoleScopeIds = '?ids=' + encodedRoleScopeIds;
  }

  const apiUrl = `${restBaseUrl}/stockmanagement/userrolescope/${roleScopeIds[0]}${encodedRoleScopeIds}`;
  const abortController = new AbortController();

  return openmrsFetch(apiUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}
