import {
  FetchResponse,
  openmrsFetch,
  OpenmrsResource,
  restBaseUrl,
  useConfig,
  useOpenmrsPagination,
} from '@openmrs/esm-framework';
import { DeceasedPatientResponse, PaymentMethod, VisitTypeResponse, Location, Patient, Visit } from '../types';
import useSWR from 'swr';
import { BillingConfig, ConfigObject } from '../config-schema';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { makeUrlUrl } from '../utils/utils';

const getMorguePatientStatus = async (
  patientUuid: string,
  morgueVisitTypeUuid: string,
  morgueDischargeEncounter: string,
): Promise<'discharged' | 'admitted' | 'awaiting'> => {
  const customRepresentation = 'custom:(visitType:(uuid),startDatetime,stopDatetime,encounters:(encounterType:(uuid)))';
  const url = `${restBaseUrl}/visit?v=${customRepresentation}&includeInactive=false&patient=${patientUuid}&limit=1`;
  const response = await openmrsFetch<{
    results: Array<{
      visitType: { uuid: string };
      startDatetime: string;
      stopDatetime: any;
      encounters: Array<{
        encounterType: {
          uuid: string;
        };
      }>;
    }>;
  }>(url);
  const visit = response?.data?.results[0];
  const hasDischargeEncounter = visit?.encounters?.some(
    (encounter) => encounter.encounterType.uuid === morgueDischargeEncounter,
  );
  const isMorgueVisit = visit?.visitType?.uuid === morgueVisitTypeUuid;
  const isVisitActive = !(typeof visit?.stopDatetime === 'string');
  if (!isMorgueVisit) {
    return 'awaiting';
  }
  if (hasDischargeEncounter) {
    return 'discharged';
  }
  return 'admitted';
};
export const useDeceasedPatient = () => {
  const { morgueVisitTypeUuid, morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();
  const [deceasedPatient, setDeceasedPatient] = useState([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState();
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true`;

  const { data, error, isLoading } = useSWRImmutable<{ data: DeceasedPatientResponse }>(url, openmrsFetch);
  useEffect(() => {
    if (data?.data?.results?.length) {
      (async () => {
        try {
          setIsLoadingStatus(true);
          const status = await Promise.all(
            data.data.results.map((data) => {
              return getMorguePatientStatus(data?.uuid, morgueVisitTypeUuid, morgueDischargeEncounterTypeUuid);
            }),
          );

          setDeceasedPatient(data.data.results.map((patient, index) => ({ ...patient, status: status[index] })));
        } catch (error) {
          setStatusError(error);
        } finally {
          setIsLoadingStatus(false);
        }
      })();
    }
  }, [morgueVisitTypeUuid, morgueDischargeEncounterTypeUuid, data]);

  return { data: deceasedPatient, error: error ?? statusError, isLoading: isLoading || isLoadingStatus };
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
  const url = `${restBaseUrl}/cashier/paymentMode?v=full`;
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
  const url = `${restBaseUrl}/cashier/billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(uuid,display),servicePrices:(uuid,name,price,paymentMode))`;
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
  const postUrl = `${restBaseUrl}/cashier/bill`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};

export const useCashPoint = () => {
  const url = `/ws/rest/v1/cashier/cashPoint`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);

  return { isLoading, error, cashPoints: data?.data?.results ?? [] };
};

export const startVisitWithEncounter = (payload) => {
  const postUrl = `${restBaseUrl}/encounter`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};
export const useActiveMorgueVisit = (patientUuid: string) => {
  const customRepresentation = 'custom:(visitType:(uuid),startDatetime,stopDatetime,encounters:(encounterType:(uuid)))';
  const url = `${restBaseUrl}/visit?v=${customRepresentation}&includeInactive=false&patient=${patientUuid}&limit=1`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<Visit> }>>(url, openmrsFetch);
  const activeDeceased = data?.data?.results;

  return { data: activeDeceased, error, isLoading };
};
const usePerson = (uuid: string) => {
  const customRepresentation = `custom:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display))`;
  const url = `${restBaseUrl}/person/${uuid}?v=${customRepresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Patient['person']>>(url, openmrsFetch);
  const person = data?.data;
  return { isLoading, error, person };
};

export default usePerson;
