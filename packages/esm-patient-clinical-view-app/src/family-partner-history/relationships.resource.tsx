import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, FHIRResource, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { RelationshipTypeResponse } from '../case-management/workspace/case-management.resource';
import { ConfigObject } from '../config-schema';

interface RelationshipsResponse {
  results: Array<Relationship>;
}

interface ExtractedRelationship {
  uuid: string;
  display: string;
  relativeAge: number;
  name: string;
  dead: boolean;
  causeOfDeath: string;
  relativeUuid: string;
  relationshipType: string;
  relationshipTypeDisplay: string;
  relationshipTypeUUID: string;
  patientUuid: string;
}

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
}

interface Person {
  uuid: string;
  age: number;
  dead: boolean;
  display: string;
  causeOfDeath: string;
}

type FHIRResourceResponse = {
  total: number;
  entry: Array<FHIRResource>;
};

interface RelationshipType {
  uuid: string;
  display: string;
  direction: string;
}

export const useCodedConceptObservations = (patientUuid: string, conceptUuid: string) => {
  const url = `/ws/fhir2/R4/Observation?subject:Patient=${patientUuid}&code=${conceptUuid}&_summary=data&_sort=-date&_count=100`;

  const { data, isLoading, error, mutate, isValidating } = useSWR<{ data: FHIRResourceResponse }>(
    conceptUuid ? url : null,
    openmrsFetch,
  );

  const formattedObservations = data?.data ? mapObservations(data?.data) : null;

  return {
    observations: formattedObservations ? formattedObservations : null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
};

function mapObservations(obsData) {
  if (obsData?.total > 0) {
    return obsData?.entry?.map((obs) => {
      return {
        id: obs?.resource?.id,
        value: obs?.resource?.valueCodeableConcept?.text,
      };
    });
  }
}

export const useAllRelationshipTypes = () => {
  const url = `${restBaseUrl}/relationshiptype?v=default`;
  const { data, error } = useSWRImmutable<{ data: RelationshipTypeResponse }>(url, openmrsFetch);

  return { data, error };
};

export const useMappedRelationshipTypes = () => {
  const url = `${restBaseUrl}/relationshiptype?v=default`;
  const { data, error, isLoading } = useSWRImmutable<{ data?: RelationshipTypeResponse }>(url, openmrsFetch);

  const relations: RelationshipType[] = [];

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
      ? relations.push(aIsToB)
      : bIsToA.display === 'Patient'
      ? relations.push(aIsToB, {
          display: `Patient (${aIsToB.display})`,
          uuid: type.uuid,
          direction: 'bIsToA',
        })
      : relations.push(aIsToB, bIsToA);
  });

  return { data: relations, error, isLoading };
};

export function usePatientRelationships(patientUuid: string) {
  const customRepresentation =
    'custom:(display,uuid,personA:(uuid,age,display,dead,causeOfDeath),personB:(uuid,age,display,dead,causeOfDeath),relationshipType:(uuid,display,description,aIsToB,bIsToA))';

  const relationshipsUrl = patientUuid
    ? `/ws/rest/v1/relationship?person=${patientUuid}&v=${customRepresentation}`
    : null;

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<RelationshipsResponse>, Error>(
    relationshipsUrl,
    openmrsFetch,
    {
      revalidateOnFocus: false,
    },
  );

  const relationships = useMemo(() => {
    return data?.data?.results?.length ? extractRelationshipData(patientUuid, data?.data?.results) : [];
  }, [data?.data?.results, patientUuid]);

  return {
    relationships,
    error,
    isLoading,
    isValidating,
    relationshipsUrl,
  };
}

function extractRelationshipData(
  patientIdentifier: string,
  relationships: Array<Relationship>,
): Array<ExtractedRelationship> {
  const relationshipsData = [];
  for (const r of relationships) {
    if (patientIdentifier === r.personA.uuid) {
      relationshipsData.push({
        uuid: r.uuid,
        name: extractName(r.personB.display),
        display: r.personB.display,
        relativeAge: r.personB.age,
        dead: r.personB.dead,
        causeOfDeath: r.personB.causeOfDeath,
        relativeUuid: r.personB.uuid,
        relationshipType: r.relationshipType.bIsToA,
        relationshipTypeDisplay: r.relationshipType.display,
        relationshipTypeUUID: r.relationshipType.uuid,
        patientUuid: r.personB.uuid,
      });
    } else {
      relationshipsData.push({
        uuid: r.uuid,
        name: extractName(r.personA.display),
        display: r.personA.display,
        relativeAge: r.personA.age,
        causeOfDeath: r.personA.causeOfDeath,
        relativeUuid: r.personA.uuid,
        dead: r.personA.dead,
        relationshipType: r.relationshipType.aIsToB,
        relationshipTypeDisplay: r.relationshipType.display,
        relationshipTypeUUID: r.relationshipType.uuid,
        patientUuid: r.personA.uuid,
      });
    }
  }
  return relationshipsData;
}

function extractName(display: string) {
  const pattern = /-\s*(.*)$/;
  const match = display.match(pattern);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return display.trim();
}
