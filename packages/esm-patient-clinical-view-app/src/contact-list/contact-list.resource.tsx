import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { Enrollment, HTSEncounter, Patient } from '../types';
import { replaceAll } from '../utils/expression-helper';

export const ContactListFormSchema = z.object({
  listingDate: z.date({ coerce: true }),
  givenName: z.string().min(1, 'Required'),
  middleName: z.string().min(1, 'Required'),
  familyName: z.string().min(1, 'Required'),
  gender: z.enum(['M', 'F']),
  dateOfBirth: z.date({ coerce: true }).max(new Date(), 'Must not be a future date'),
  maritalStatus: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  relationshipToPatient: z.string().uuid('Invalid relationship type').min(1, 'Required'),
  livingWithClient: z.string().optional(),
  baselineStatus: z.string().optional(),
  preferedPNSAproach: z.string().optional(),
});

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
      en.obs.some(
        (ob) =>
          ob.value && ob.value.display && ['positive', 'hiv positive'].includes(ob.value.display.toLocaleLowerCase()),
      ),
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
  // Create person payload
  const personPayload = {
    names: [{ givenName, middleName, familyName }],
    gender,
    birthdate: dateOfBirth,
    addresses: address ? [{ preferred: true, address1: address }] : undefined,
    dead: false,
    attributes: [
      // Add optional baseline HIV Status attrobute
      ...(baselineStatus
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.baselineHIVStatus,
              value: replaceAll(baselineStatus, 'A', ''),
            },
          ]
        : []),
      // Add Optional Telephone contact attribute
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
      // Add Optional Prefered PNS Aproach attribute
      ...(preferedPNSAproach
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.preferedPnsAproach,
              value: replaceAll(preferedPNSAproach, 'A', ''),
            },
          ]
        : []),
      // Add optional living with client attribute
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
    // patient creation success
    results.push({
      step: 'person',
      message: 'Patient created successfully',
      status: 'fulfilled',
    });
    // Create relationship payload
    const relationshipPayload = {
      personA: patient.person.uuid,
      relationshipType: relationshipToPatient,
      personB: patientUuid,
      startDate: listingDate.toISOString(),
    };
    // Create optional encounter with marital/civil status obs
    let demographicsPayload;
    if (maritalStatus) {
      demographicsPayload = {
        ...encounter,
        encounterType: config.registrationEncounterUuid,
        patient: patient.uuid,
        obs: [{ concept: config.maritalStatusUuid, value: maritalStatus }],
      };
    }
    // excecute patient relationship and obs creation tasks in parallell
    const asyncTask = await Promise.allSettled([
      fetcher(`/ws/rest/v1/relationship`, relationshipPayload),
      ...(maritalStatus ? [fetcher(`/ws/rest/v1/encounter`, demographicsPayload)] : []),
    ]);
    // Track excection status on finish
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
