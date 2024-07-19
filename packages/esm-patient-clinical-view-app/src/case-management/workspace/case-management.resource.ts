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

interface RelationshipType {
  uuid: string;
  display: string;
}

interface RelationshipTypeResponse {
  results: RelationshipType[];
}
interface RelationshipTypeResponse {
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

export const useRelationshipType = () => {
  const customRepresentation = 'custom:(uuid,display)&q=Case manager';
  const url = `/ws/rest/v1/relationshiptype?v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: RelationshipTypeResponse }>(url, openmrsFetch);

  return { data, error };
};

export const useAllRelationshipTypes = () => {
  const customRepresentation = 'custom:(uuid,display)';
  const url = `/ws/rest/v1/relationshiptype?v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: RelationshipTypeResponse }>(url, openmrsFetch);

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

export const useActivecases = (caseManagerPersonUuid: String) => {
  const customRepresentation = 'custom:(display,uuid,personA:(uuid,display),personB:(uuid,display),startDate,endDate)';
  const url = `/ws/rest/v1/relationship?person=${caseManagerPersonUuid}&v=${customRepresentation}`;
  const { data, error } = useSWRImmutable<{ data: ResultsResponse }>(url, openmrsFetch);
  const { mutate: fetchCases } = useSWRImmutable(url, openmrsFetch);
  return { data, error, mutate: fetchCases };
};
