import { formatDatetime, openmrsFetch, parseDate } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

export interface Relationship {
  display: string;
  uuid: string;
  personA: Person;
  personB: Person;
  relationshipType: {
    uuid: string;
    display: string;
    aIsToB: string;
    bIsToA: string;
  };
  startDate: string;
}

interface Contact {
  uuid: string;
  name: string;
  display: string;
  relativeAge: number;
  dead: boolean;
  causeOfDeath: string;
  relativeUuid: string;
  relationshipType: string;
  patientUuid: string;
  gender: string;
  contact: string;
  startDate: string;
}

interface Person {
  uuid: string;
  age: number;
  dead: boolean;
  display: string;
  causeOfDeath: string;
  gender: string;
  attributes: {
    uuid: string;
    display: string;
  }[];
}

function extractName(display: string) {
  const pattern = /-\s*(.*)$/;
  const match = display.match(pattern);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return display.trim();
}

function extractTelephone(display: string) {
  const pattern = /=\s*(.*)$/;
  const match = display.match(pattern);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return display.trim();
}

export const useContacts = (patientUuid: string) => {
  const customeRepresentation =
    'custom:(display,uuid,personA:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display)),personB:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display)),relationshipType:(uuid,display,description,aIsToB,bIsToA),startDate)';
  const url = `/ws/rest/v1/relationship?v=${customeRepresentation}`;
  const { data, error, isLoading, mutate, isValidating } = useSWR<{ data: { results: Relationship[] } }, Error>(
    url,
    openmrsFetch,
  );
  const relationships = useMemo(() => {
    return data?.data?.results?.length ? extractContactData(patientUuid, data?.data?.results) : [];
  }, [data?.data?.results, patientUuid]);

  return {
    contacts: relationships,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

function extractContactData(patientIdentifier: string, relationships: Array<Relationship>): Array<Contact> {
  const relationshipsData: Contact[] = [];
  const telUuid = 'f7ed0636-3911-493c-9565-6829f6841aa7';
  for (const r of relationships) {
    if (patientIdentifier === r.personA.uuid) {
      const tel: string | undefined = r.personB.attributes.find((attr) => attr.uuid === telUuid)?.display;
      relationshipsData.push({
        uuid: r.uuid,
        name: extractName(r.personB.display),
        display: r.personB.display,
        relativeAge: r.personB.age,
        dead: r.personB.dead,
        causeOfDeath: r.personB.causeOfDeath,
        relativeUuid: r.personB.uuid,
        relationshipType: r.relationshipType.bIsToA,
        patientUuid: r.personB.uuid,
        gender: r.personB.gender,
        contact: tel ? extractTelephone(tel) : '--',
        startDate: !r.startDate
          ? '--'
          : formatDatetime(parseDate(r.startDate), { day: true, mode: 'standard', year: true, noToday: true }),
      });
    } else {
      const tel: string | undefined = r.personA.attributes.find((attr) => attr.uuid === telUuid)?.display;

      relationshipsData.push({
        uuid: r.uuid,
        name: extractName(r.personA.display),
        display: r.personA.display,
        relativeAge: r.personA.age,
        causeOfDeath: r.personA.causeOfDeath,
        relativeUuid: r.personA.uuid,
        dead: r.personA.dead,
        relationshipType: r.relationshipType.aIsToB,
        patientUuid: r.personA.uuid,
        gender: r.personB.gender,
        contact: tel ? extractTelephone(tel) : '--',
        startDate: !r.startDate
          ? '--'
          : formatDatetime(parseDate(r.startDate), { day: true, mode: 'standard', year: true, noToday: true }),
      });
    }
  }
  return relationshipsData;
}
