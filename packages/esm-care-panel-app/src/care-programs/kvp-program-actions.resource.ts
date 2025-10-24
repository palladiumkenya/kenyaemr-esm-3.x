import { FetchResponse, openmrsFetch, Patient, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { CarePanelConfig } from '../config-schema';
import useSWR from 'swr';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import useSWRImmutable from 'swr/immutable';

type Relationship = {
  display: string;
  uuid: string;
  personA: {
    uuid: string;
    display: string;
  };
  personB: {
    uuid: string;
    display: string;
  };
  startDate: string;
  endDate: string;
  relationshipType: {
    uuid: string;
    display: string;
  };
};

interface PeerEducator {
  uuid: string;
  display: string;
  person: {
    uuid: string;
  };
}

export const usePatientActivePeerEducator = (patientUuid: string) => {
  const { peerEducatorRelationshipType } = useConfig<CarePanelConfig>();
  const rep =
    'custom:(display,uuid,personA:(uuid,display),personB:(uuid,display),startDate,endDate,relationshipType:(uuid,display))';
  const url = `${restBaseUrl}/relationship?person=${patientUuid}&v=${rep}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ results: Array<Relationship> }>>(url, openmrsFetch);
  const activePeer = useMemo(
    () =>
      (data?.data?.results ?? []).filter(
        (rel) =>
          rel.relationshipType.uuid === peerEducatorRelationshipType &&
          (!rel.endDate || dayjs(rel.endDate).isAfter(dayjs())),
      ),
    [data, peerEducatorRelationshipType],
  );
  return {
    activePeer,
    isLoading,
    mutate,
    error,
  };
};

export const usePeerEducators = () => {
  const customRepresentation = 'custom:(uuid,display,person:(uuid))';
  const url = `/ws/rest/v1/provider?v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<FetchResponse<{ results: Array<PeerEducator> }>>(url, openmrsFetch);

  return { data, error };
};

export const saveRelationship = (payload) => {
  const url = `/ws/rest/v1/relationship`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const usePerson = (uuid: string) => {
  const customRepresentation = `custom:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),attributes:(uuid,display,value,attributeType:(uuid,display)))`;
  const url = `${restBaseUrl}/person/${uuid}?v=${customRepresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Patient['person']>>(url, openmrsFetch);
  const person = data?.data;
  return { isLoading, error, person };
};

export function extractNameString(formattedString: string) {
  if (!formattedString) {
    return '';
  }
  const parts = formattedString.split(' - ');
  return parts.length > 1 ? parts[1] : '';
}
