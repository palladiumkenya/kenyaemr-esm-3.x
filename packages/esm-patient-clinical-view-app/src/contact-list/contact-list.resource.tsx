import { Session } from '@openmrs/esm-framework';
import omit from 'lodash/omit';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { BOOLEAN_YES, relationshipFormSchema, saveRelationship } from '../relationships/relationship.resources';
import { Enrollment, HTSEncounter, Person } from '../types';
import { replaceAll } from '../utils/expression-helper';

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
