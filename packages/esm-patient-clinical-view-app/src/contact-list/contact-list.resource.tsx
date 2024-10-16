import { Session } from '@openmrs/esm-framework';
import omit from 'lodash/omit';
import { z } from 'zod';
import { ConfigObject } from '../config-schema';
import { relationshipFormSchema, saveRelationship } from '../relationships/relationship.resources';
import { Enrollment, HTSEncounter } from '../types';
import { replaceAll } from '../utils/expression-helper';
export const BOOLEAN_YES = '1065';
export const BOOLEAN_NO = '1066';

export const ContactListFormSchema = relationshipFormSchema
  .extend({
    physicalAssault: z.enum([BOOLEAN_YES, BOOLEAN_NO]).optional(),
    threatened: z.enum([BOOLEAN_YES, BOOLEAN_NO]).optional(),
    sexualAssault: z.enum([BOOLEAN_YES, BOOLEAN_NO]).optional(),
    livingWithClient: z.string().optional(),
    baselineStatus: z.string().optional(),
    preferedPNSAproach: z.string().optional(),
    ipvOutCome: z.enum(['True', 'False']).optional(),
  })
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
      ...(ipvOutCome
        ? [
            {
              attributeType: config.contactPersonAttributesUuid.contactIPVOutcome,
              value: ipvOutCome,
            },
          ]
        : []),
    ],
  );
};
