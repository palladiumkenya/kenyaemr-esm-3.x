import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, FHIRResource, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { RelationshipTypeResponse } from '../case-management/workspace/case-management.resource';
import { ConfigObject } from '../config-schema';
import { extractContactData } from '../hooks/useContacts';
import { Relationship } from '../types';

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
  const customeRepresentation =
    'custom:(display,uuid,personA:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,value,attributeType:(uuid,display))),personB:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,value,attributeType:(uuid,display))),relationshipType:(uuid,display,description,aIsToB,bIsToA),startDate)';
  const url = patientUuid ? `/ws/rest/v1/relationship?v=${customeRepresentation}&person=${patientUuid}` : null;

  const config = useConfig<ConfigObject>();

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<{ results: Array<Relationship> }>, Error>(
    url,
    openmrsFetch,
    {
      revalidateOnFocus: false,
    },
  );
  const familyRelationships = useMemo(
    () => config.relationshipTypesList.filter((rl) => rl.category.some((c) => c === 'family')),
    [config],
  );

  const relationships = useMemo(() => {
    return data?.data?.results?.length
      ? extractContactData(
          patientUuid,
          data?.data?.results.filter((rel) =>
            familyRelationships.some((famRel) => famRel.uuid === rel.relationshipType.uuid),
          ),
          config,
        )
      : [];
  }, [data?.data?.results, patientUuid, config, familyRelationships]);

  return {
    relationships: relationships ?? [],
    error,
    isLoading,
    isValidating,
    relationshipsUrl: url,
  };
}
