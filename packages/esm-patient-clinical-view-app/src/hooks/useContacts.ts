import { formatDate, formatDatetime, openmrsFetch, parseDate, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { ConfigObject } from '../config-schema';
import { Contact, Person, Relationship } from '../types';

function extractName(display: string) {
  const pattern = /-\s*(.*)$/;
  const match = display.match(pattern);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return display.trim();
}

function extractValue(display: string) {
  const pattern = /=\s*(.*)$/;
  const match = display.match(pattern);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return display.trim();
}

const getConceptName = (key) => {
  return conceptIdNameMap.get(key);
};

const conceptIdNameMap = new Map([
  ['162284', 'Dual referral'],
  ['163096', 'Provider referral'],
  ['161642', 'Contract referral'],
  ['160551', 'Passive referral'],
  ['703', 'Positive'],
  ['664', 'Negative'],
  ['1067', 'Unknown'],
  ['1066', 'No'],
  ['1065', 'Yes'],
  ['162570', 'Declined to answer'],
]);

function extractAttributeData(person: Person, config: ConfigObject) {
  return person.attributes.reduce<{
    contact: string | null;
    baselineHIVStatus: string | null;
    personContactCreated: string | null;
    pnsAproach: string | null;
    livingWithClient: string | null;
    ipvOutcome: string | null;
  }>(
    (prev, attr) => {
      if (attr.attributeType.uuid === config.contactPersonAttributesUuid.telephone) {
        return { ...prev, contact: attr.display ? extractValue(attr.display) : null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.baselineHIVStatus) {
        return { ...prev, baselineHIVStatus: getConceptName(attr.value) ?? null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.contactCreated) {
        return { ...prev, personContactCreated: getConceptName(attr.value) ?? null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.livingWithContact) {
        return { ...prev, livingWithClient: getConceptName(attr.value) ?? null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.preferedPnsAproach) {
        return { ...prev, pnsAproach: getConceptName(attr.value) ?? null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.contactIPVOutcome) {
        return { ...prev, ipvOutcome: attr.display ? extractValue(attr.display) : null };
      }
      return prev;
    },
    {
      contact: null,
      baselineHIVStatus: null,
      personContactCreated: null,
      pnsAproach: null,
      livingWithClient: null,
      ipvOutcome: null,
    },
  );
}

function extractContactData(
  patientIdentifier: string,
  relationships: Array<Relationship>,
  config: ConfigObject,
): Array<Contact> {
  const relationshipsData: Contact[] = [];

  for (const r of relationships) {
    if (patientIdentifier === r.personA.uuid) {
      relationshipsData.push({
        ...extractAttributeData(r.personB, config),
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
        startDate: !r.startDate ? null : formatDate(parseDate(r.startDate)),
      });
    } else {
      relationshipsData.push({
        ...extractAttributeData(r.personA, config),
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
        startDate: !r.startDate ? null : formatDate(parseDate(r.startDate)),
      });
    }
  }
  return relationshipsData;
}

const useContacts = (patientUuid: string, filters: (relationship: Relationship) => boolean) => {
  const customeRepresentation =
    'custom:(display,uuid,personA:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,value,attributeType:(uuid,display))),personB:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,value,attributeType:(uuid,display))),relationshipType:(uuid,display,description,aIsToB,bIsToA),startDate)';
  const url = `/ws/rest/v1/relationship?v=${customeRepresentation}&person=${patientUuid}`;
  const config = useConfig<ConfigObject>();
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Relationship[] } }, Error>(
    url,
    openmrsFetch,
  );
  const relationships = useMemo(() => {
    return data?.data?.results?.length
      ? extractContactData(patientUuid, data?.data?.results.filter(filters), config)
      : [];
  }, [data?.data?.results, patientUuid, config]);
  return {
    contacts: relationships,
    error,
    isLoading,
    isValidating,
  };
};

export default useContacts;
