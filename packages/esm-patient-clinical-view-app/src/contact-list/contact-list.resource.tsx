import { formatDatetime, openmrsFetch, parseDate, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { Enrollment, HTSEncounter, Contact, Patient, Person, Relationship, RelationShipType } from '../types';

export const ContactListFormSchema = z.object({
  listingDate: z.date({ coerce: true }),
  givenName: z.string().min(1, 'Required'),
  middleName: z.string().min(1, 'Required'),
  familyName: z.string().min(1, 'Required'),
  gender: z.enum(['M', 'F']),
  dateOfBirth: z.date({ coerce: true }).max(new Date()),
  maritalStatus: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  relationshipToPatient: z.string().uuid(),
  livingWithClient: z.string().optional(),
  baselineStatus: z.string().optional(),
  preferedPNSAproach: z.string().optional(),
});

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

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
}
export const useContacts = (patientUuid: string) => {
  const customeRepresentation =
    'custom:(display,uuid,personA:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,value,attributeType:(uuid,display))),personB:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,attributeType:(uuid,display))),relationshipType:(uuid,display,description,aIsToB,bIsToA),startDate)';
  const url = `/ws/rest/v1/relationship?v=${customeRepresentation}&person=${patientUuid}`;
  const config = useConfig<ConfigObject>();
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Relationship[] } }, Error>(
    url,
    openmrsFetch,
  );
  const relationships = useMemo(() => {
    return data?.data?.results?.length ? extractContactData(patientUuid, data?.data?.results, config) : [];
  }, [data?.data?.results, patientUuid, config]);
  return {
    contacts: relationships,
    error,
    isLoading,
    isValidating,
  };
};

export const useRelationshipTypes = () => {
  const customeRepresentation = 'custom:(uuid,displayAIsToB)';
  const url = `/ws/rest/v1/relationshiptype?v=${customeRepresentation}`;

  const { data, error, isLoading } = useSWR<{ data: { results: RelationShipType[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    relationshipTypes: data?.data?.results ?? [],
  };
};

export const useRelativeHivEnrollment = (relativeUuid: string) => {
  const customeRepresentation = 'custom:(uuid,program:(name,uuid))';
  const url = `/ws/rest/v1/programenrollment?v=${customeRepresentation}&patient=${relativeUuid}`;
  const config = useConfig<ConfigObject>();
  const { data, error, isLoading } = useSWR<{ data: { results: Enrollment[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    enrollment: (data?.data?.results ?? []).find((en) => en.program.uuid === config.hivProgramUuid) ?? null,
  };
};

export const useRelativeHTSEncounter = (relativeUuid: string) => {
  const customeRepresentation = 'custom:(uuid,display,encounterDatetime,obs:(uuid,display,value:(uuid,display)))';
  const {
    encounterTypes: { hivTestingServices },
  } = useConfig<ConfigObject>();
  const url = `/ws/rest/v1/encounter?v=${customeRepresentation}&patient=${relativeUuid}&encounterType=${hivTestingServices}`;
  const { data, error, isLoading } = useSWR<{ data: { results: HTSEncounter[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    encounters: data?.data?.results ?? [],
  };
};

function extractAttributeData(person: Person, config: ConfigObject) {
  return person.attributes.reduce<{
    contact: string | null;
    baselineHIVStatus: string | null;
    personContactCreated: string | null;
    pnsAproach: string | null;
    livingWithClient: string | null;
  }>(
    (prev, attr) => {
      if (attr.attributeType.uuid === config.contactPersonAttributesUuid.telephone) {
        return { ...prev, contact: attr.display ? extractTelephone(attr.display) : null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.baselineHIVStatus) {
        return { ...prev, baselineHIVStatus: getConceptName(attr.value) ?? null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.contactCreated) {
        return { ...prev, personContactCreated: getConceptName(attr.value) ?? null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.livingWithContact) {
        return { ...prev, livingWithClient: getConceptName(attr.value) ?? null };
      } else if (attr.attributeType.uuid === config.contactPersonAttributesUuid.preferedPnsAproach) {
        return { ...prev, pnsAproach: getConceptName(attr.value) ?? null };
      }
      return prev;
    },
    { contact: null, baselineHIVStatus: null, personContactCreated: null, pnsAproach: null, livingWithClient: null },
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
        startDate: !r.startDate
          ? null
          : formatDatetime(parseDate(r.startDate), { day: true, mode: 'standard', year: true, noToday: true }),
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
        startDate: !r.startDate
          ? null
          : formatDatetime(parseDate(r.startDate), { day: true, mode: 'standard', year: true, noToday: true }),
      });
    }
  }
  return relationshipsData;
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

export const getHivStatusBasedOnEnrollmentAndHTSEncounters = (
  encounters: HTSEncounter[],
  enrollment: Enrollment | null,
) => {
  if (enrollment) {
    return 'Positive';
  }
  if (!enrollment && !encounters.length) {
    return 'Unknown';
  }
  if (
    !enrollment &&
    encounters.length &&
    encounters.findIndex((en) =>
      en.obs.some((ob) => ['positive', 'hiv positive'].includes(ob.value.display.toLocaleLowerCase())),
    ) !== -1
  ) {
    return 'Positive';
  }
  return 'Negative';
};

const fetcher = async <T = any,>(url: string, payload: T) => {
  const response = await openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    return await response.json();
  }
  throw new Error(`Fetch failed with status ${response.status}`);
};

export const saveContact = async (
  {
    givenName,
    middleName,
    familyName,
    gender,
    address,
    baselineStatus,
    dateOfBirth,
    listingDate,
    livingWithClient,
    maritalStatus,
    phoneNumber,
    preferedPNSAproach,
    relationshipToPatient,
  }: z.infer<typeof ContactListFormSchema>,
  patientUuid: string,
  encounter: Record<string, any>,
  config: ConfigObject,
) => {
  const results: {
    step: 'person' | 'relationship' | 'obs' | 'patient';
    status: 'fulfilled' | 'rejected';
    message: string;
  }[] = [];
  // Create person
  const personPayload = {
    names: [{ givenName, middleName, familyName }],
    gender,
    birthdate: dateOfBirth,
    addresses: address ? [{ preferred: true, address1: address }] : undefined,
    dead: false,
    attributes: [
      ...(baselineStatus
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.baselineHIVStatus,
              value: replaceAll(baselineStatus, 'A', ''),
            },
          ]
        : []),
      ...(phoneNumber
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.telephone,
              value: phoneNumber,
            },
          ]
        : []),
      {
        attributeType: config.contactPersonAttributesUuid.contactCreated,
        value: '1065',
      },
      ...(preferedPNSAproach
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.preferedPnsAproach,
              value: replaceAll(preferedPNSAproach, 'A', ''),
            },
          ]
        : []),
      ...(livingWithClient
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.livingWithContact,
              value: replaceAll(livingWithClient, 'A', ''),
            },
          ]
        : []),
    ],
  };
  try {
    // Generate Openmrs Id for the patient
    const identifier = await generateOpenmrsIdentifier(config.openmrsIdentifierSourceUuid);
    // Create patient
    const patient: Patient = await fetcher(`/ws/rest/v1/patient`, {
      person: personPayload,
      identifiers: [
        {
          identifier: identifier.data.identifier,
          identifierType: config.openmrsIDUuid,
          location: encounter.location,
        },
      ],
    });

    // Person creation success
    results.push({
      step: 'person',
      message: 'Patient created successfully',
      status: 'fulfilled',
    });
    // Create patient, relationship and obs in parallell
    const relationshipPayload = {
      personA: patient.person.uuid,
      relationshipType: relationshipToPatient,
      personB: patientUuid,
      startDate: listingDate.toISOString(),
    };

    const now = new Date().toISOString();
    // Create encounter with marital status obs
    let demographicsPayload;
    if (maritalStatus) {
      demographicsPayload = {
        ...encounter,
        encounterType: config.registrationEncounterUuid,
        patient: patient.uuid,
        obs: [{ concept: config.maritalStatusUuid, value: maritalStatus }],
      };
    }

    const asyncTask = await Promise.allSettled([
      fetcher(`/ws/rest/v1/relationship`, relationshipPayload),
      ...(maritalStatus ? [fetcher(`/ws/rest/v1/encounter`, demographicsPayload)] : []),
    ]);

    asyncTask.forEach(({ status }, index) => {
      let message: string;
      let step: any;
      if (index === 0) {
        message = status === 'fulfilled' ? 'Relationship created successfully' : 'Error creating Relationship';
        step = 'relationship';
      } else if (index === 1) {
        message =
          status === 'fulfilled' ? 'Contact demographics saved succesfully!' : 'Error saving contact demographics';
        step = 'obs';
      }
      results.push({
        status,
        message,
        step,
      });
    });
  } catch (error) {
    results.push({ message: 'Error creating patient', step: 'person', status: 'rejected' });
  }
  return results;
};

export function generateOpenmrsIdentifier(source: string) {
  const abortController = new AbortController();
  return openmrsFetch(`${restBaseUrl}/idgen/identifiersource/${source}/identifier`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {},
    signal: abortController.signal,
  });
}
