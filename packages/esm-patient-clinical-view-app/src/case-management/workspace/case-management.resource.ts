import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

interface CaseManager {
  uuid: string;
  display: string;
  person: {
    uuid: string;
  };
}

interface CaseManagerResponse {
  results: CaseManager[];
}

export interface RelationshipType {
  uuid: string;
  display: string;
  displayAIsToB: string;
  displayBIsToA: string;
}

export interface RelationshipTypeResponse {
  results: RelationshipType[];
}

interface Person {
  uuid: string;
  display: string;
}

interface Result {
  display: string;
  uuid: string;
  personA: Person;
  personB: Person;
  startDate: string;
  endDate: string | null;
}

interface ResultsResponse {
  results: Result[];
}

export const useCaseManagers = () => {
  const customRepresentation = 'custom:(uuid,display,person:(uuid))';
  const url = `/ws/rest/v1/provider?v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: CaseManagerResponse }>(url, openmrsFetch);

  return { data, error };
};

export const useCaseManagerRelationshipType = () => {
  const customRepresentation = 'custom:(uuid,display,displayAIsToB,displayBIsToA)&q=Case manager';
  const url = `/ws/rest/v1/relationshiptype?v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: RelationshipTypeResponse }>(url, openmrsFetch);

  const mappedRelationshipTypes: Array<{ uuid: string; display: string; direction: string }> = [];

  data?.data.results.forEach((type) => {
    const aIsToB = {
      display: type.displayAIsToB ? type.displayAIsToB : type.displayBIsToA,
      uuid: type.uuid,
      direction: 'aIsToB',
    };
    const bIsToA = {
      display: type.displayBIsToA ? type.displayBIsToA : type.displayAIsToB,
      uuid: type.uuid,
      direction: 'bIsToA',
    };
    aIsToB.display === bIsToA.display
      ? mappedRelationshipTypes.push(aIsToB)
      : mappedRelationshipTypes.push(aIsToB, bIsToA);
  });

  return { data: mappedRelationshipTypes, error };
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

export const useActivecases = (caseManagerPersonUuid: String) => {
  const customRepresentation = 'custom:(display,uuid,personA:(uuid,display),personB:(uuid,display),startDate,endDate)';
  const url = `/ws/rest/v1/relationship?person=${caseManagerPersonUuid}&v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: ResultsResponse }>(url, openmrsFetch);
  const { mutate: fetchCases } = useSWRImmutable(url, openmrsFetch);
  return { data, error, mutate: fetchCases };
};
