import {
  FetchResponse,
  openmrsFetch,
  OpenmrsResource,
  restBaseUrl,
  useConfig,
  useOpenmrsPagination,
  type Visit,
} from '@openmrs/esm-framework';
import { DeceasedPatientResponse, PaymentMethod, VisitTypeResponse, Location } from '../types';
import useSWRImmutable from 'swr/immutable';
import { makeUrlUrl } from '../utils/utils';
import useSWR from 'swr';
import { BillingConfig, ConfigObject } from '../config-schema';
import { useState } from 'react';

export const useDeceasedPatient = () => {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true`;

  const { data, error, isLoading, mutate } = useSWRImmutable<{ data: DeceasedPatientResponse }>(url, openmrsFetch);

  const deceasedPatient = data?.data?.results || null;

  return { data: deceasedPatient, error, isLoading, mutate };
};

export const usePatientPaginatedEncounters = (patientUuid: string) => {
  const customRepresentation =
    'custom:(visitType:(uuid,name,display),uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis),form:(uuid,display),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';
  const url = makeUrlUrl(`${restBaseUrl}/encounter?patient=${patientUuid}&v=full`);

  const paginatedEncounter = useOpenmrsPagination(url, 10);
  return paginatedEncounter;
};

export const useVisitType = () => {
  const customRepresentation = 'custom:(uuid,display,name)';
  const url = `${restBaseUrl}/visittype?v=${customRepresentation}`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: VisitTypeResponse[] }>>(url, openmrsFetch);
  const visitType = data?.data?.results || null;

  return { data: visitType, error, isLoading };
};

export const usePaymentModes = (excludeWaiver: boolean = true) => {
  const { excludedPaymentMode } = useConfig<BillingConfig>();
  const url = `/ws/rest/v1/cashier/paymentMode?v=full`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<PaymentMethod> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  const allowedPaymentModes =
    excludedPaymentMode?.length > 0
      ? data?.data?.results.filter((mode) => !excludedPaymentMode.some((excluded) => excluded.uuid === mode.uuid)) ?? []
      : data?.data?.results ?? [];
  return {
    paymentModes: excludeWaiver ? allowedPaymentModes : data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

export const useBillableItems = () => {
  const url = `/ws/rest/v1/cashier/billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(uuid,display),servicePrices:(uuid,name,price,paymentMode))`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredItems =
    data?.data?.results?.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];
  return {
    lineItems: filteredItems,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
  };
};

export const useMorgueCompartment = () => {
  const { morgueCompartmentTagUuid } = useConfig<ConfigObject>();
  const customRepresentation = 'custom:(uuid,display,name)';
  const url = `${restBaseUrl}/location?v=${customRepresentation}&tag=${morgueCompartmentTagUuid}`;
  const { data, isLoading, error } = useSWR<FetchResponse<{ results: Array<Location> }>>(url, openmrsFetch);

  return {
    morgueCompartments: data?.data?.results ?? [],
    isLoading,
    error,
  };
};

export const createPatientBill = (payload) => {
  const postUrl = `/ws/rest/v1/cashier/bill`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};

export const useCashPoint = () => {
  const url = `/ws/rest/v1/cashier/cashPoint`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);

  return { isLoading, error, cashPoints: data?.data?.results ?? [] };
};

export const startVisitWithEncounter = (payload) => {
  const postUrl = `/ws/rest/v1/encounter`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};

export function useVisit(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,diagnoses:(uuid,display,certainty,diagnosis:(coded:(uuid,display))),encounterDatetime,encounterType:(uuid,display),encounterProviders:(uuid,display,provider:(uuid,person:(uuid,display)))),location:(uuid,name,display),visitType:(uuid,name,display),startDatetime,stopDatetime)&limit=1';

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
