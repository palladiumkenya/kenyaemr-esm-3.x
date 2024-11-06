import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { mockInterventions, mockPackages } from './claims-form.mocks';

interface Provider {
  uuid: string;
  display: string;
}

interface ProvidersResponse {
  results: Provider[];
}

export function useVisit(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,patient,encounters:(uuid,diagnoses:(uuid,display,certainty,diagnosis:(coded:(uuid,display))),encounterDatetime,encounterType:(uuid,display),encounterProviders:(uuid,display,provider:(uuid,person:(uuid,display)))),location:(uuid,name,display),visitType:(uuid,name,display),startDatetime,stopDatetime)&limit=1';

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    visits: data ? data?.data?.results[0] : null,
    error,
    isLoading,
    isValidating,
    mutateVisits: mutate,
  };
}

export const useProviders = () => {
  const customRepresentation = 'custom:(uuid,display)';
  const url = `/ws/rest/v1/provider?v=${customRepresentation}`;
  const { data, error, isLoading } = useSWRImmutable<{ data: ProvidersResponse }>(url, openmrsFetch);

  return { data, error, isLoading };
};

export const processClaims = (payload) => {
  const url = `/ws/rest/v1/insuranceclaims/claims`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const retryClaim = (claimUUID: string) => {
  const url = `/ws/rest/v1/insuranceclaims/claims/sendToExternal?claimUuid=${claimUUID}`;
  return openmrsFetch(url, {
    method: 'GET',
  });
};

export const useInterventions = () => {
  const interventions = useMemo(() => mockInterventions, []);
  return {
    isLoading: false,
    interventions: interventions,
    error: undefined,
  };
};

export const usePackages = () => {
  const _packages = useMemo(() => mockPackages, []);
  return {
    isLoading: false,
    packages: _packages,
    error: undefined,
  };
};
