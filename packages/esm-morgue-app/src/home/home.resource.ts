import React, { useMemo } from 'react';
import useSWR from 'swr';
import {
  FetchResponse,
  openmrsFetch,
  restBaseUrl,
  fhirBaseUrl,
  useConfig,
  useFhirPagination,
} from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { EnhancedPatient, Entry, MortuaryLocationResponse, QueueEntriesResponse, QueueEntry } from '../types';

export const useMortuaryQueueEntries = () => {
  const { mortuaryQueueUuid, mortuaryQueueStatusUuid } = useConfig<ConfigObject>();

  const params = new URLSearchParams({
    queue: mortuaryQueueUuid,
    status: mortuaryQueueStatusUuid,
    isEnded: 'false',
    v: 'full',
  });

  const url = `${restBaseUrl}/queue-entry?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<QueueEntriesResponse>>(url, openmrsFetch);

  const queueEntries = useMemo(() => data?.data?.results ?? [], [data]);

  return {
    queueEntries,
    isLoading,
    error,
    mutate,
  };
};

export const useDischargedPatients = (admissionLocation?: MortuaryLocationResponse) => {
  const { morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();
  const [currPageSize] = React.useState(100);

  const locationUuid = admissionLocation?.ward?.uuid;
  const dischargeUrl =
    locationUuid && morgueDischargeEncounterTypeUuid
      ? `${fhirBaseUrl}/Encounter?_summary=data&type=${morgueDischargeEncounterTypeUuid}&location=${locationUuid}`
      : null;

  const {
    data: dischargeData,
    isLoading: dischargeLoading,
    error: dischargeError,
    mutate: mutateDischarge,
  } = useFhirPagination<Entry>(dischargeUrl, currPageSize);

  const { dischargedPatients, dischargedPatientsCount } = useMemo(() => {
    if (!dischargeData || !Array.isArray(dischargeData) || dischargeLoading) {
      return { dischargedPatients: [], dischargedPatientsCount: 0 };
    }

    const discharged = dischargeData.filter((entry) => entry?.subject?.reference);
    return {
      dischargedPatients: discharged,
      dischargedPatientsCount: discharged.length,
    };
  }, [dischargeData, dischargeLoading]);

  return {
    dischargedPatients,
    dischargedPatientsCount,
    isLoading: dischargeLoading,
    error: dischargeError,
    mutate: mutateDischarge,
  };
};

export const transformQueueEntryToPatient = (queueEntry: QueueEntry): EnhancedPatient => {
  return {
    uuid: queueEntry.patient.uuid,
    person: {
      display: queueEntry.patient.person.display,
      gender: queueEntry.patient.person.gender,
      age: queueEntry.patient.person.age,
      deathDate: queueEntry.patient.person.deathDate,
      causeOfDeath: queueEntry.patient.person.causeOfDeath,
    },
    identifiers: queueEntry.patient.identifiers || [],
    queueInfo: {
      queueEntryUuid: queueEntry.uuid,
      queueName: queueEntry.queue.display,
      status: queueEntry.status.display,
      priority: queueEntry.priority?.display,
      priorityComment: queueEntry.priorityComment,
      startedAt: queueEntry.startedAt,
    },
  };
};

export function useVisitQueueEntry(patientUuid: string, visitUuid: string) {
  const apiUrl = `${restBaseUrl}/visit-queue-entry?v=full&patient=${patientUuid}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<any> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const mappedVisitQueueEntry = useMemo(() => {
    if (!data?.data?.results) {
      return null;
    }

    return (
      data.data.results
        .map(mapVisitQueueEntryProperties)
        .filter((entry) => visitUuid !== undefined && visitUuid === entry.visitUuid)
        .shift() ?? null
    );
  }, [data, visitUuid]);

  return {
    queueEntry: mappedVisitQueueEntry,
    isLoading,
    error,
    isValidating,
    mutate,
  };
}

function mapVisitQueueEntryProperties(visitQueueEntry: any): any {
  return {
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
  };
}

export const removeFromMortuaryQueue = async (queueEntryUuid: string) => {
  const abortController = new AbortController();

  const payload = {
    endedAt: new Date().toISOString(),
  };

  return openmrsFetch(`${restBaseUrl}/queue-entry/${queueEntryUuid}`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
};
