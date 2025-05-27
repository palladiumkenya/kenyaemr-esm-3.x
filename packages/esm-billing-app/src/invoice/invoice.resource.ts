import {
  Concept,
  FetchResponse,
  openmrsFetch,
  restBaseUrl,
  toDateObjectStrict,
  toOmrsIsoString,
  useSession,
  Visit,
} from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ShaFacilityStatusResponse } from '../types';

export interface VisitQueueEntry {
  queueEntry: VisitQueueEntry;
  uuid: string;
  visit: Visit;
  queue: Queue;
}

export interface Queue {
  uuid: string;
  display: string;
  name: string;
  description: string;
  location: Location;
  service: string;
  allowedPriorities: Array<Concept>;
  allowedStatuses: Array<Concept>;
}

export interface MappedVisitQueueEntry {
  visitUuid: string;
  queue: Queue;
  queueEntryUuid: string;
}

export function useVisitQueueEntry(
  patientUuid: string,
  visitUuid: string,
): {
  queueEntry: MappedVisitQueueEntry | null;
  isLoading: boolean;
  error: Error;
  isValidating?: boolean;
  mutate: () => void;
} {
  const apiUrl = `${restBaseUrl}/visit-queue-entry?v=full&patient=${patientUuid}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const mappedVisitQueueEntry =
    data?.data?.results
      ?.map(
        (visitQueueEntry: VisitQueueEntry): MappedVisitQueueEntry => ({
          queue: visitQueueEntry.queueEntry.queue,
          queueEntryUuid: visitQueueEntry.queueEntry.uuid,
          visitUuid: visitQueueEntry.visit?.uuid,
        }),
      )
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

export const useShaFacilityStatus = () => {
  const { authenticated } = useSession();

  const url = `${restBaseUrl}/kenyaemr/sha-facility-status?synchronize=true`;

  const { data, isLoading, error, mutate } = useSWR<FetchResponse<ShaFacilityStatusResponse>>(
    authenticated ? url : null,
    openmrsFetch,
  );

  const shaFacilityStatus = data?.data;

  return {
    shaFacilityStatus,
    isLoading,
    error,
    mutate,
  };
};
