import { FetchResponse, openmrsFetch, Patient, restBaseUrl, Session, showSnackbar } from '@openmrs/esm-framework';
import omit from 'lodash/omit';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { BOOLEAN_YES, relationshipFormSchema, saveRelationship } from '../relationships/relationship.resources';
import { type ContactAttributeData, Enrollment, HTSEncounter, type Person } from '../types';
import { replaceAll } from '../utils/expression-helper';
import useSWR, { mutate } from 'swr';

export const ContactListFormSchema = relationshipFormSchema
  .refine(
    (data) => {
      return !(data.mode === 'search' && !data.personB);
    },
    { message: 'Required', path: ['personB'] },
  )
  .refine(
    (data) => {
      return !(data.mode === 'create' && !data.personBInfo);
    },
    { path: ['personBInfo'], message: 'Please provide patient information' },
  );

export const contactIPVOutcomeOptions = [
  { label: 'True', value: 'True' },
  { label: 'False', value: 'False' },
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
    encounters.findIndex((en) =>
      en.obs.some(
        (ob) =>
          ob?.value &&
          ob.value?.display &&
          ['positive', 'hiv positive'].includes(ob.value?.display?.toLocaleLowerCase()),
      ),
    ) !== -1
  ) {
    return 'Positive';
  }
  return 'Negative';
};

export const saveContact = async (
  data: z.infer<typeof ContactListFormSchema>,
  config: ConfigObject,
  session: Session,
  personAttributes: Person['attributes'] = [],
) => {
  const { baselineStatus, ipvOutCome, preferedPNSAproach, livingWithClient } = data;

  // Save contact
  await saveRelationship(
    omit(data, [
      'baselineStatus',
      'ipvOutCome',
      'physicalAssault',
      'preferedPNSAproach',
      'livingWithClient',
      'sexualAssault',
      'threatened',
    ]),
    config,
    session,
    [
      // Add optional baseline HIV Status attrobute
      ...(baselineStatus
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.baselineHIVStatus,
              value: replaceAll(baselineStatus, 'A', ''),
              attribute: personAttributes.find(
                (a) => a.attributeType.uuid === config.contactPersonAttributesUuid.baselineHIVStatus,
              )?.uuid,
            },
          ]
        : []),
      // Add Optional Telephone contact attribute
      ...(data.mode === 'create'
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.contactCreated,
              value: BOOLEAN_YES,
            },
          ]
        : []),
      // Add Optional Prefered PNS Aproach attribute
      ...(preferedPNSAproach
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.preferedPnsAproach,
              value: replaceAll(preferedPNSAproach, 'A', ''),
              attribute: personAttributes.find(
                (a) => a.attributeType.uuid === config.contactPersonAttributesUuid.preferedPnsAproach,
              )?.uuid,
            },
          ]
        : []),
      // Add optional living with client attribute
      ...(livingWithClient
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.livingWithContact,
              value: replaceAll(livingWithClient, 'A', ''),
              attribute: personAttributes.find(
                (a) => a.attributeType.uuid === config.contactPersonAttributesUuid.livingWithContact,
              )?.uuid,
            },
          ]
        : []),
      ...(ipvOutCome
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.contactIPVOutcome,
              value: ipvOutCome,
              attribute: personAttributes.find(
                (a) => a.attributeType.uuid === config.contactPersonAttributesUuid.contactIPVOutcome,
              )?.uuid,
            },
          ]
        : []),
    ],
  );
};

const usePerson = (uuid: string) => {
  const customRepresentation = `custom:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),attributes:(uuid,display,value,attributeType:(uuid,display)))`;
  const url = `${restBaseUrl}/person/${uuid}?v=${customRepresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Patient['person']>>(url, openmrsFetch);
  const person = data?.data;
  return { isLoading, error, person };
};

export default usePerson;

export const createPersonAttribute = (payload: any, personUuid: string) => {
  const url = `${restBaseUrl}/person/${personUuid}/attribute`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updatePersonAttributes = (payload: any, personUuid: string, attributeUuid: string) => {
  const url = `${restBaseUrl}/person/${personUuid}/attribute/${attributeUuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const ATTRIBUTE_MAPPINGS = [
  { key: 'baselineStatus', configPath: 'baselineHIVStatus', cleanValue: true },
  { key: 'preferedPNSAproach', configPath: 'preferedPnsAproach', cleanValue: true },
  { key: 'livingWithClient', configPath: 'livingWithContact', cleanValue: true },
  { key: 'ipvOutCome', configPath: 'contactIPVOutcome', cleanValue: false },
];

const createAttribute = (
  attributeType: string,
  value: string,
  existingAttributes: Person['attributes'],
  cleanValue: boolean = true,
) => ({
  attributeType,
  value: cleanValue ? replaceAll(value, 'A', '') : value,
  attribute: existingAttributes.find((a) => a.attributeType.uuid === attributeType)?.uuid,
});

const buildAttributes = (
  attributes: ContactAttributeData,
  config: ConfigObject,
  existingAttributes: Person['attributes'] = [],
) => {
  if (!attributes) {
    return [];
  }

  return ATTRIBUTE_MAPPINGS.filter((m) => attributes[m.key]).map((m) =>
    createAttribute(
      config.contactPersonAttributesUuid[m.configPath],
      attributes[m.key],
      existingAttributes,
      m.cleanValue,
    ),
  );
};

export const updateContactAttributes = async (
  personUuid: string,
  attributes: ContactAttributeData,
  config: ConfigObject,
  existingAttributes: Person['attributes'] = [],
) => {
  try {
    const attrs = buildAttributes(attributes, config, existingAttributes);

    const results = await Promise.allSettled(
      attrs.map((attr) =>
        openmrsFetch(`${restBaseUrl}/person/${personUuid}/attribute/${attr.attribute ?? ''}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(omit(attr, ['attribute'])),
        }),
      ),
    );

    if (results.length && results.every((r) => r.status === 'fulfilled')) {
      showSnackbar({ title: 'Success ', kind: 'success', subtitle: 'Patient attributes updated succesfully' });
    }
    results.forEach((res) => {
      if (res.status === 'rejected') {
        showSnackbar({ title: 'Error updating patient attribute', kind: 'error', subtitle: res.reason?.message });
      }
    });

    mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/person`));
  } catch (error) {
    showSnackbar({
      title: 'Error',
      kind: 'error',
      subtitle: 'Failed to update person attributes: ' + error?.message,
    });
    throw error;
  }
};
