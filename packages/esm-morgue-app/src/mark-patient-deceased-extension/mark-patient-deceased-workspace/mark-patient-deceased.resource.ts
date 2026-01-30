import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig, useSession, type FetchResponse } from '@openmrs/esm-framework';
import { ConfigObject } from '../../config-schema';
import { CauseOfDeathPayload, Diagnosis, DiagnosisResponse, EncounterPayload, Obs, QueueEntryPayload } from '../type';

export const useDiagnosis = (searchQuery: string) => {
  const customRepresentation = `custom:(uuid,display)`;
  const { icd11DataSourceUuid } = useConfig<ConfigObject>();
  const url = `${restBaseUrl}/concept?v=${customRepresentation}&q=${searchQuery}&source=${icd11DataSourceUuid}`;

  const { isLoading, error, data } = useSWR<FetchResponse<DiagnosisResponse>>(
    searchQuery && searchQuery.length >= 3 ? url : null,
    openmrsFetch,
  );

  const diagnoses = data?.data?.results;
  return { isLoading, error, diagnoses };
};

const changePatientDeathStatus = (personUuid: string, payload: CauseOfDeathPayload) => {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/person/${personUuid}`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
};

const addToMortuaryQueue = async (patientUuid: string, config: ConfigObject) => {
  const abortController = new AbortController();

  const queueEntryPayload: QueueEntryPayload = {
    queue: config.mortuaryQueueUuid,
    patient: patientUuid,
    status: config.mortuaryQueueStatusUuid,
    priority: config.mortuaryNotUrgentPriorityUuid,
    startedAt: new Date().toISOString(),
    priorityComment: null,
  };

  return openmrsFetch(`${restBaseUrl}/queue-entry`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: queueEntryPayload,
    signal: abortController.signal,
  });
};

const createDeathEncounter = async (
  patientUuid: string,
  deathDate: Date,
  immediateCause: string,
  antecedentCause: string | undefined,
  underlyingCondition: string | undefined,
  transferTo: string,
  receivingMortuaryName: string | undefined,
  serialNumber: string | undefined,
  config: ConfigObject,
  sessionLocation: string,
  currentProvider: string,
) => {
  const abortController = new AbortController();

  const diagnoses: Array<Diagnosis> = [];

  if (immediateCause) {
    diagnoses.push({
      diagnosis: {
        coded: immediateCause,
      },
      certainty: 'CONFIRMED',
      rank: 4,
      voided: false,
    });
  }

  if (antecedentCause) {
    diagnoses.push({
      diagnosis: {
        coded: antecedentCause,
      },
      certainty: 'CONFIRMED',
      rank: 5,
      voided: false,
    });
  }

  if (underlyingCondition) {
    diagnoses.push({
      diagnosis: {
        coded: underlyingCondition,
      },
      certainty: 'CONFIRMED',
      rank: 6,
      voided: false,
    });
  }

  const obs: Array<Obs> = [];

  obs.push({
    concept: config.transferToQuestionUuid,
    value: transferTo,
  });

  if (transferTo === config.otherFacilityMortuaryUuid) {
    if (receivingMortuaryName) {
      obs.push({
        concept: config.nameOfReceivingMortuaryUuid,
        value: receivingMortuaryName,
      });
    }

    if (serialNumber) {
      obs.push({
        concept: config.serialNumberUuid,
        value: serialNumber,
      });
    }
  }

  const encounterPayload: EncounterPayload = {
    encounterDatetime: deathDate.toISOString(),
    patient: patientUuid,
    encounterType: config.mortalityEncounterTypeUuid,
    location: sessionLocation,
    encounterProviders: [
      {
        provider: currentProvider,
        encounterRole: config.encounterProviderRoleUuid,
      },
    ],
    obs: obs,
    diagnoses: diagnoses,
  };

  return openmrsFetch(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-type': 'application/json',
    },
    method: 'POST',
    body: encounterPayload,
    signal: abortController.signal,
  });
};
export async function markPatientDeceased(
  deathDate: Date,
  patientUuid: string,
  immediateCause: string,
  antecedentCause: string | undefined,
  underlyingCondition: string | undefined,
  transferTo: string,
  receivingMortuaryName: string | undefined,
  serialNumber: string | undefined,
  sessionLocation: string,
  currentProvider: string,
  config: ConfigObject,
) {
  const deathPayload: CauseOfDeathPayload = {
    dead: true,
    deathDate: deathDate,
    causeOfDeath: immediateCause,
  };

  try {
    await changePatientDeathStatus(patientUuid, deathPayload);

    await createDeathEncounter(
      patientUuid,
      deathDate,
      immediateCause,
      antecedentCause,
      underlyingCondition,
      transferTo,
      receivingMortuaryName,
      serialNumber,
      config,
      sessionLocation,
      currentProvider,
    );

    if (transferTo === config.currentMortuaryUuid) {
      await addToMortuaryQueue(patientUuid, config);
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
}
