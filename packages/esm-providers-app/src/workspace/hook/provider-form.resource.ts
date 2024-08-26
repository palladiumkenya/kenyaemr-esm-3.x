import { FetchResponse, openmrsFetch, OpenmrsResource, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { useCallback, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { FacilityResponse, Practitioner, RolesResponse } from '../../types';
import useSWR from 'swr';
import { ConfigObject } from '../../config-schema';

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
  };
};

export const useRoles = () => {
  const customRepresentation = 'custom:(uuid,display)';
  const url = `${restBaseUrl}/role?v=${customRepresentation}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: RolesResponse }>(url, openmrsFetch);
  const roles = data?.data?.results || [];
  return { roles, error, isLoading };
};

export const useFacility = (searchTerm: string) => {
  const customRepresentation = 'custom:(uuid,name,attributes:(value))';
  const url = `${restBaseUrl}/location?v=${customRepresentation}&q=${searchTerm}&limit=15`;
  const { data, error, isLoading } = useSWRImmutable<{ data: FacilityResponse }>(searchTerm ? url : null, openmrsFetch);

  return { data: data?.data?.results, error, isLoading };
};

const convertToIdenitifertype = (identifierType) => {
  return identifierType.toLowerCase().replace(/\s+/g, '-');
};
export const useHWR = (identifierType: string, identifierNumber: string) => {
  const url = `${restBaseUrl}/kenyaemr/practitionersearch?${convertToIdenitifertype(
    identifierType,
  )}=${identifierNumber}`;
  const { data, error, isLoading } = useSWR<FetchResponse<Practitioner>>(url, openmrsFetch);
  const response = data?.data;
  return { response, error, isLoading };
};
export const searchHealthCareWork = async (identifierType: string, identifierNumber: string) => {
  const url = `${restBaseUrl}/kenyaemr/practitionersearch?${convertToIdenitifertype(
    identifierType,
  )}=${identifierNumber}`;
  const response = await openmrsFetch(url);
  return response.json();
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
