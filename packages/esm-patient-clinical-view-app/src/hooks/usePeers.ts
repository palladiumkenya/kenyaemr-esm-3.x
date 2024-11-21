import { FetchResponse, formatDate, openmrsFetch, parseDate, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { ConfigObject } from '../config-schema';
import { Peer, Person, Relationship } from '../types';

function extractValue(display: string) {
  const pattern = /=\s*(.*)$/;
  const match = display.match(pattern);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return display.trim();
}

function extractAttributeData(person: Person, config: ConfigObject) {
  return person.attributes.reduce<{
    contact: string | null;
  }>(
    (prev, attr) => {
      if (attr.attributeType.uuid === config.contactPersonAttributesUuid.telephone) {
        return { ...prev, contact: attr.display ? extractValue(attr.display) : null };
      }
      return prev;
    },
    {
      contact: null,
    },
  );
}

function getPeer(relationship: Relationship, config: ConfigObject, person: 'personA' | 'personB') {
  return {
    ...extractAttributeData(relationship[person], config),
    uuid: relationship.uuid,
    name: relationship[person].display,
    display: relationship[person].display,
    relativeAge: relationship[person].age,
    dead: relationship[person].dead,
    causeOfDeath: relationship[person].causeOfDeath,
    relativeUuid: relationship[person].uuid,
    relationshipType: relationship.relationshipType.bIsToA,
    patientUuid: relationship[person].uuid,
    gender: relationship[person].gender,
    startDate: !relationship.startDate ? null : relationship.startDate,
    age: relationship[person].age,
    endDate: !relationship.endDate ? null : relationship.endDate,
  } as Peer;
}

function extractPeerData(
  patientIdentifier: string,
  relationships: Array<Relationship>,
  config: ConfigObject,
): Array<Peer> {
  const relationshipsData: Peer[] = [];
  let peerEducator: Peer | null = null;
  for (const r of relationships) {
    if (patientIdentifier === r.personA.uuid) {
      relationshipsData.push(getPeer(r, config, 'personB'));
    } else {
      relationshipsData.push(getPeer(r, config, 'personA'));
    }
    if (peerEducator === null) {
      if (patientIdentifier === r.personA.uuid) {
        peerEducator = getPeer(r, config, 'personA');
      } else {
        peerEducator = getPeer(r, config, 'personB');
      }
    }
  }
  if (peerEducator) {
    return [peerEducator, ...relationshipsData];
  }
  return relationshipsData;
}

const usePeers = (peerEducatorUuid: string) => {
  const customeRepresentation =
    'custom:(display,uuid,personA:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,value,attributeType:(uuid,display))),personB:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,value,attributeType:(uuid,display))),relationshipType:(uuid,display,description,aIsToB,bIsToA),startDate,endDate)';
  const url = `${restBaseUrl}/relationship?v=${customeRepresentation}&person=${peerEducatorUuid}`;
  const config = useConfig<ConfigObject>();
  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<{ results: Array<Relationship> }>, Error>(
    url,
    openmrsFetch,
  );
  const relationships = useMemo(() => {
    return data?.data?.results?.length
      ? extractPeerData(
          peerEducatorUuid,
          data?.data?.results.filter((rel) => rel.relationshipType?.uuid === config.peerEducatorRelationship),
          config,
        )
      : [];
  }, [data?.data?.results, peerEducatorUuid, config]);
  return {
    peers: relationships,
    error,
    isLoading,
    isValidating,
  };
};

export default usePeers;
