import { openmrsFetch } from '@openmrs/esm-framework';
import { Encounter, UpdateObs } from '../types';

export function saveEncounter(encounter: Encounter) {
  const abortController = new AbortController();

  return openmrsFetch(`/ws/rest/v1/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: encounter,
    signal: abortController.signal,
  });
}

export function updateEncounter(encounter: UpdateObs, encounterUuid) {
  const abortController = new AbortController();

  return openmrsFetch(`/ws/rest/v1/encounter/${encounterUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: encounter,
    signal: abortController.signal,
  });
}

export function deleteEncounter(encounterUuid) {
  const abortController = new AbortController();

  return openmrsFetch(`/ws/rest/v1/encounter/${encounterUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'DELETE',
    signal: abortController.signal,
  });
}
