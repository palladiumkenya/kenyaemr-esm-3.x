import {
  FetchResponse,
  openmrsFetch,
  openmrsObservableFetch,
  OpenmrsResource,
  restBaseUrl,
  toDateObjectStrict,
  toOmrsIsoString,
  useConfig,
  useOpenmrsPagination,
} from '@openmrs/esm-framework';
import {
  DeceasedPatientResponse,
  PaymentMethod,
  VisitTypeResponse,
  Location,
  Patient,
  Visit,
  UseVisitQueueEntries,
  VisitQueueEntry,
  MappedVisitQueueEntry,
  UpdateVisitPayload,
  PaginatedResponse,
} from '../types';
import useSWR from 'swr';
import { BillingConfig, ConfigObject } from '../config-schema';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { makeUrlUrl } from '../utils/utils';
import type { Observable } from 'rxjs';

const getMorguePatientStatus = async (
  patientUuid: string,
  morgueVisitTypeUuid: string,
  morgueDischargeEncounter: string,
): Promise<'discharged' | 'admitted' | 'awaiting'> => {
  const customRepresentation = 'custom:(visitType:(uuid),startDatetime,stopDatetime,encounters:(encounterType:(uuid)))';
  const url = `${restBaseUrl}/visit?v=${customRepresentation}&patient=${patientUuid}&limit=1`;
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
export const useDeceasedPatient = (searchTerm?: string) => {
  const { morgueVisitTypeUuid, morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();
  const [deceasedPatient, setDeceasedPatient] = useState([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState();
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const uril = makeUrlUrl(`${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true&q=${searchTerm}`);
  const pageSize = 10;
  const {
    data: paginatedData,
    error: paginatedError,
    isLoading: isPaginatedLoading,
  } = useOpenmrsPagination<PaginatedResponse>(uril, pageSize);

  useEffect(() => {
    if (paginatedData?.length) {
      (async () => {
        try {
          setIsLoadingStatus(true);
          const status = await Promise.all(
            paginatedData.map((data) =>
              getMorguePatientStatus(data.person?.uuid, morgueVisitTypeUuid, morgueDischargeEncounterTypeUuid),
            ),
          );

          setDeceasedPatient(
            paginatedData.map((patient, index) => ({
              ...patient,
              status: status[index],
            })),
          );
        } catch (error) {
          setStatusError(error);
        } finally {
          setIsLoadingStatus(false);
        }
      })();
    }
  }, [morgueVisitTypeUuid, morgueDischargeEncounterTypeUuid, paginatedData]);

  return {
    data: deceasedPatient,
    error: paginatedError ?? statusError,
    isLoading: isPaginatedLoading || isLoadingStatus,
  };
};
// Used
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
// // Used
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
// // Used
export const createPatientBill = (payload) => {
  const postUrl = `${restBaseUrl}/cashier/bill`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};
// Used
export const useCashPoint = () => {
  const url = `/ws/rest/v1/cashier/cashPoint`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);

  return { isLoading, error, cashPoints: data?.data?.results ?? [] };
};

export const startVisitWithEncounter = (payload) => {
  const postUrl = `${restBaseUrl}/encounter`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};
// Retired
export const useActiveMorgueVisit = (patientUuid: string) => {
  const customRepresentation = 'custom:(visitType:(uuid),startDatetime,stopDatetime,encounters:(encounterType:(uuid)))';
  const url = `${restBaseUrl}/visit?v=${customRepresentation}&includeInactive=false&patient=${patientUuid}&limit=1`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<Visit> }>>(url, openmrsFetch);
  const activeDeceased = data?.data?.results;

  return { data: activeDeceased, error, isLoading };
};
// // Used

export const usePerson = (uuid: string) => {
  const customRepresentation = `custom:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),attributes:(uuid,display))`;
  const url = `${restBaseUrl}/person/${uuid}?v=${customRepresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Patient['person']>>(url, openmrsFetch);
  const person = data?.data;
  return { isLoading, error, person };
};
// Used
export function useVisitQueueEntry(patientUuid, visitUuid): UseVisitQueueEntries {
  const apiUrl = `${restBaseUrl}/visit-queue-entry?v=full&patient=${patientUuid}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );
  const mapVisitQueueEntryProperties = (visitQueueEntry: VisitQueueEntry): MappedVisitQueueEntry => ({
    id: visitQueueEntry.uuid,
    name: visitQueueEntry.queueEntry.queue.display,
    patientUuid: visitQueueEntry.queueEntry.patient.uuid,
    priority:
      visitQueueEntry.queueEntry.priority.display === 'Urgent'
        ? 'Priority'
        : visitQueueEntry.queueEntry.priority.display,
    priorityUuid: visitQueueEntry.queueEntry.priority.uuid,
    service: visitQueueEntry.queueEntry.queue?.display,
    status: visitQueueEntry.queueEntry.status.display,
    statusUuid: visitQueueEntry.queueEntry.status.uuid,
    visitUuid: visitQueueEntry.visit?.uuid,
    visitType: visitQueueEntry.visit?.visitType?.display,
    queue: visitQueueEntry.queueEntry.queue,
    queueEntryUuid: visitQueueEntry.queueEntry.uuid,
  });

  const mappedVisitQueueEntry =
    data?.data?.results
      ?.map(mapVisitQueueEntryProperties)
      .filter((visitQueueEntry) => visitUuid !== undefined && visitUuid === visitQueueEntry.visitUuid)
      .shift() ?? null;
  return {
    queueEntry: mappedVisitQueueEntry,
    isLoading,
    error: error,
    isValidating,
    mutate,
  };
}
// Used
export function removeQueuedPatient(
  queueUuid: string,
  queueEntryUuid: string,
  abortController: AbortController,
  endedAt?: Date,
) {
  return openmrsFetch(`${restBaseUrl}/queue/${queueUuid}/entry/${queueEntryUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      endedAt: toDateObjectStrict(toOmrsIsoString(endedAt) ?? toOmrsIsoString(new Date())),
    },
    signal: abortController.signal,
  });
}

export function updateVisit(
  uuid: string,
  payload: UpdateVisitPayload,
  abortController: AbortController,
): Observable<any> {
  return openmrsObservableFetch(`${restBaseUrl}/visit/${uuid}`, {
    signal: abortController.signal,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: payload,
  });
}
