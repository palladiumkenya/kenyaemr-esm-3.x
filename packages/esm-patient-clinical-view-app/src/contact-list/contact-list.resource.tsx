import { formatDatetime, openmrsFetch, parseDate, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';

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
  contact: string | null;
  startDate: string | null;
  baselineHIVStatus: string | null;
  personContactCreated: string | null;
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
    attributeType: {
      uuid: string;
      display: string;
    };
  }[];
}

interface Patient {
  uuid: string;
  person: Person;
  identifiers: {
    uuid: string;
  }[];
}

interface RelationShipType {
  uuid: string;
  displayAIsToB: string;
}

interface Enrollment {
  uuid: string;
  program: {
    name: string;
    uuid: string;
  };
}

interface HTSEncounter {
  uuid: string;
  display: string;
  encounterDatetime: string;
  obs: {
    uuid: string;
    display: string;
    obsDatetime: string;
    value: string;
  }[];
}
export const ContactListFormSchema = z.object({
  listingDate: z.date({ coerce: true }),
  givenName: z.string().min(1, 'Required'),
  middleName: z.string().min(1, 'Required'),
  familyName: z.string().min(1, 'Required'),
  gender: z.enum(['M', 'F']),
  dateOfBirth: z.date({ coerce: true }),
  maritalStatus: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
  relationshipToPatient: z.string().uuid(),
  livingWithClient: z.string().optional(),
  baselineStatus: z.string().optional(),
  preferedPNSAproach: z.string(),
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
    'custom:(display,uuid,personA:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,attributeType:(uuid,display))),personB:(uuid,age,display,dead,causeOfDeath,gender,attributes:(uuid,display,attributeType:(uuid,display))),relationshipType:(uuid,display,description,aIsToB,bIsToA),startDate)';
  const url = `/ws/rest/v1/relationship?v=${customeRepresentation}&person=${patientUuid}`;
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
  const hivProgram = 'dfdc6d40-2f2f-463d-ba90-cc97350441a8';
  const { data, error, isLoading } = useSWR<{ data: { results: Enrollment[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    enrollment: (data?.data?.results ?? []).find((en) => en.program.uuid === hivProgram) ?? null,
  };
};

export const useRelativeHTSEncounter = (relativeUuid: string) => {
  const customeRepresentation = 'custom:(uuid,program:(name,uuid))';
  const {
    encounterTypes: { hivTestingServices },
    formsList: { htsInitialTest },
  } = useConfig<ConfigObject>();
  const url = `/ws/rest/v1/encounter?v=${customeRepresentation}&patient=${relativeUuid}&encounterType=${hivTestingServices}`;
  const { data, error, isLoading } = useSWR<{ data: { results: HTSEncounter[] } }>(url, openmrsFetch);
  return {
    error,
    isLoading,
    encounters: data?.data?.results ?? [],
  };
};

function extractContactData(patientIdentifier: string, relationships: Array<Relationship>): Array<Contact> {
  const relationshipsData: Contact[] = [];
  const telUuid = 'b2c38640-2603-4629-aebd-3b54f33f1e3a';
  const baseHIVStatusUuid = '3ca03c84-632d-4e53-95ad-91f1bd9d96d6';
  const contactCreatedUuid = '7c94bd35-fba7-4ef7-96f5-29c89a318fcf';
  for (const r of relationships) {
    if (patientIdentifier === r.personA.uuid) {
      const tel: string | undefined = r.personB.attributes.find((attr) => attr.attributeType.uuid === telUuid)?.display;
      const baselineHIVStatus: string | undefined = r.personB.attributes.find(
        (attr) => attr.attributeType.uuid === baseHIVStatusUuid,
      )?.display;
      const contactCreated = r.personB.attributes.find(
        (attr) => attr.attributeType.uuid === contactCreatedUuid,
      )?.display;
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
        contact: tel ? extractTelephone(tel) : null,
        baselineHIVStatus: baselineHIVStatus ?? null,
        personContactCreated: contactCreated ?? null,
        startDate: !r.startDate
          ? null
          : formatDatetime(parseDate(r.startDate), { day: true, mode: 'standard', year: true, noToday: true }),
      });
    } else {
      const tel: string | undefined = r.personA.attributes.find((attr) => attr.attributeType.uuid === telUuid)?.display;
      const baselineHIVStatus: string | undefined = r.personA.attributes.find(
        (attr) => attr.attributeType.uuid === baseHIVStatusUuid,
      )?.display;
      const contactCreated = r.personA.attributes.find(
        (attr) => attr.attributeType.uuid === contactCreatedUuid,
      )?.display;

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
        contact: tel ? extractTelephone(tel) : null,
        baselineHIVStatus: baselineHIVStatus ?? null,
        personContactCreated: contactCreated ?? null,
        startDate: !r.startDate
          ? null
          : formatDatetime(parseDate(r.startDate), { day: true, mode: 'standard', year: true, noToday: true }),
      });
    }
  }
  return relationshipsData;
}

export const contactLivingWithPatient = [
  { value: '1065', label: 'Yes' },
  { value: '1066', label: 'No' },
  { value: '162570', label: 'Declined to answer' },
];

export const pnsAproach = [
  { value: '160551', label: 'Passive referral' },
  { value: '161642', label: 'Contract referral' },
  { value: '163096', label: 'Provider referral' },
  { value: '162284', label: 'Dual referral' },
];

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
    encounters.findIndex((en) => en.obs.some((ob) => ob.value === 'Positive')) !== -1
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
  locationUuid: string,
) => {
  const results: {
    step: 'person' | 'relationship' | 'obs' | 'patient';
    status: 'fulfilled' | 'rejected';
    message: string;
  }[] = [];
  // Create person
  const baselineHIVStatus = '3ca03c84-632d-4e53-95ad-91f1bd9d96d6';
  const telephoneAttributeUuid = 'b2c38640-2603-4629-aebd-3b54f33f1e3a';
  const addedAsContactUuid = '7c94bd35-fba7-4ef7-96f5-29c89a318fcf';
  const maritalStatusUuid = '1056AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const openmrsIdTypeUuid = 'dfacd928-0370-4315-99d7-6ec1c9f7ae76';
  const personPayload = {
    names: [{ givenName, middleName, familyName }],
    gender,
    birthdate: dateOfBirth,
    addresses: [{ preferred: true, address1: address }],
    dead: false,
    attributes: [
      {
        attributeType: baselineHIVStatus,
        value: replaceAll(baselineStatus, 'A', ''),
      },
      {
        attributeType: telephoneAttributeUuid,
        value: phoneNumber,
      },
      {
        attributeType: addedAsContactUuid,
        value: '1065',
      },
    ],
  };
  try {
    // Generate Openmrs Id for the patient
    const identifier = await generateOpenmrsIdentifier();
    // Create patient
    const patient: Patient = await fetcher(`/ws/rest/v1/patient`, {
      person: personPayload,
      identifiers: [
        {
          identifier: identifier.data.identifier,
          identifierType: openmrsIdTypeUuid,
          location: locationUuid,
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
    const obsPayload = {
      person: patient.person.uuid,
      obsDatetime: now,
      concept: maritalStatusUuid,
      value: replaceAll(maritalStatus, 'A', ''),
    };

    const asyncTask = await Promise.allSettled([
      fetcher(`/ws/rest/v1/relationship`, relationshipPayload),
      fetcher(`/ws/rest/v1/obs`, obsPayload),
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
      // else {
      //   message = status === 'fulfilled' ? 'Patient created successfully' : 'Error creating Patient';
      //   step = 'patient';
      // }
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

export function generateOpenmrsIdentifier() {
  const openmrsIdentifierSourceUuid = 'fb034aac-2353-4940-abe2-7bc94e7c1e71';
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/idgen/identifiersource/${openmrsIdentifierSourceUuid}/identifier`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {},
    signal: abortController.signal,
  });
}
