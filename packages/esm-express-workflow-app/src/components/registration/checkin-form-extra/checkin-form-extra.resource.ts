import { useMemo } from 'react';
import { fhirBaseUrl, getLocale, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { Queue, QueueRoom } from '../type';
import { useSWRConfig } from 'swr/_internal';
import useSWR from 'swr';

interface FHIRResponse {
  entry: Array<{ resource: fhir.Location }>;
  total: number;
  type: string;
  resourceType: string;
}

export function useQueueLocations() {
  const apiUrl = `${fhirBaseUrl}/Location?_summary=data&_tag=queue location`;
  const { data, error, isLoading } = useSWRImmutable<{ data: FHIRResponse }>(apiUrl, openmrsFetch);

  const queueLocations = useMemo(
    () =>
      data?.data?.entry
        ?.map((response) => response.resource)
        .sort((a, b) => a.name.localeCompare(b.name, getLocale())) ?? [],
    [data?.data?.entry],
  );
  return { queueLocations, isLoading, error };
}

export async function generateVisitQueueNumber(
  location: string,
  visitUuid: string,
  queueUuid: string,
  visitQueueNumberAttributeUuid: string,
) {
  const abortController = new AbortController();

  await openmrsFetch(
    `${restBaseUrl}/queue-entry-number?location=${location}&queue=${queueUuid}&visit=${visitUuid}&visitAttributeType=${visitQueueNumberAttributeUuid}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
    },
  );
}

export async function postQueueEntry(
  visitUuid: string,
  queueUuid: string,
  patientUuid: string,
  priority: string,
  status: string,
  sortWeight: number,
  locationUuid: string,
  visitQueueNumberAttributeUuid: string,
) {
  const abortController = new AbortController();

  await Promise.all([generateVisitQueueNumber(locationUuid, visitUuid, queueUuid, visitQueueNumberAttributeUuid)]);

  return openmrsFetch(`${restBaseUrl}/visit-queue-entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: {
      visit: { uuid: visitUuid },
      queueEntry: {
        status: {
          uuid: status,
        },
        priority: {
          uuid: priority,
        },
        queue: {
          uuid: queueUuid,
        },
        patient: {
          uuid: patientUuid,
        },
        startedAt: new Date(),
        sortWeight: sortWeight,
      },
    },
  });
}

export function useQueues(locationUuid?: string) {
  const customRepresentation =
    'custom:(uuid,display,name,description,service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display),location:(uuid,display))';
  const apiUrl = `${restBaseUrl}/queue?v=${customRepresentation}` + (locationUuid ? `&location=${locationUuid}` : '');

  const { data, ...rest } = useSWRImmutable<{ data: { results: Array<Queue> } }, Error>(apiUrl, openmrsFetch);

  const queues = useMemo(
    () => data?.data?.results.sort((a, b) => a.display.localeCompare(b.display, getLocale())) ?? [],
    [data?.data?.results],
  );

  return {
    queues,
    ...rest,
  };
}
export function useMutateQueueEntries() {
  const { mutate } = useSWRConfig();

  return {
    mutateQueueEntries: () => {
      return mutate((key) => {
        return (
          typeof key === 'string' &&
          (key.includes(`${restBaseUrl}/queue-entry`) || key.includes(`${restBaseUrl}/visit-queue-entry`))
        );
      }).then(() => {
        window.dispatchEvent(new CustomEvent('queue-entry-updated'));
      });
    },
  };
}

export function useQueueRooms() {
  const customRepresentation = 'custom:(uuid,display,name,description,queue:(uuid,display))';
  const apiUrl = `${restBaseUrl}/queue-room?v=${customRepresentation}`;

  const { data, ...rest } = useSWR<{ data: { results: Array<QueueRoom> } }, Error>(apiUrl, openmrsFetch);

  const queueRooms = useMemo(
    () => data?.data?.results.sort((a, b) => a.display.localeCompare(b.display, getLocale())) ?? [],
    [data?.data?.results],
  );

  return {
    queueRooms,
    ...rest,
  };
}
