import { openmrsFetch, restBaseUrl, Session, showModal, showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { z } from 'zod';
import { Patient } from '../types';
import { ConfigObject } from '../config-schema';
import omit from 'lodash/omit';

export const relationshipUpdateFormSchema = z
  .object({
    startDate: z.date({ coerce: true }).max(new Date(), 'Can not be a furture date'),
    endDate: z.date({ coerce: true }).optional(),
    relationshipType: z.string().uuid(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] },
  );

export const updateRelationship = (relationshipUuid: string, payload: z.infer<typeof relationshipUpdateFormSchema>) => {
  const url = `${restBaseUrl}/relationship/${relationshipUuid}`;
  return openmrsFetch(url, {
    body: JSON.stringify(payload),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteRelationship = async (relationshipUuid: string) => {
  const dispose = showModal('relationship-delete-confirm-dialog', {
    onClose: () => dispose(),
    onDelete: async () => {
      try {
        const url = `${restBaseUrl}/relationship/${relationshipUuid}`;
        await openmrsFetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/relationship`));
        dispose();
        showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Relationship deleted successfully!' });
      } catch (e) {
        showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error deleting relationship' });
      }
    },
  });
};

export async function fetchPerson(query: string, abortController: AbortController) {
  const customREp = 'custom:(uuid,identifiers,person:(uuid,display,gender,age,birthdate,attributes))';
  const patientsRes = await openmrsFetch<{ results: Array<Patient> }>(
    `${restBaseUrl}/patient?q=${query}&v=${customREp}`,
    {
      signal: abortController.signal,
    },
  );
  return patientsRes?.data?.results ?? [];
}

export const relationshipFormSchema = z.object({
  personA: z.string().uuid('Invalid person'),
  personB: z.string().uuid('Invalid person').optional(),
  relationshipType: z.string().uuid(),
  startDate: z.date({ coerce: true }),
  endDate: z.date({ coerce: true }).optional(),
  mode: z.enum(['create', 'search']).default('search'),
  personBInfo: z
    .object({
      givenName: z.string().min(1, 'Given name required'),
      middleName: z.string().optional(),
      familyName: z.string().min(1, 'Family name required'),
      gender: z.enum(['M', 'F']),
      birthdate: z.date({ coerce: true }).max(new Date(), 'Must not be a future date'),
      maritalStatus: z.string().optional(),
      address: z.string().optional(),
      phoneNumber: z.string().optional(),
    })
    .optional(),
});

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

export const saveRelationship = async (
  data: z.infer<typeof relationshipFormSchema>,
  config: ConfigObject,
  session: Session,
  extraAttributes: Array<{ attributeType: string; value: string }> = [],
) => {
  // Handle patient creation
  let patient: string = data.personB;
  if (data.mode === 'create') {
    try {
      const identifier = await generateOpenmrsIdentifier(config.openmrsIdentifierSourceUuid);
      const { address, birthdate, familyName, gender, givenName, middleName, phoneNumber } = data.personBInfo;
      const response = await openmrsFetch<Patient>(`/ws/rest/v1/patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifiers: [
            {
              identifier: identifier.data.identifier,
              identifierType: config.openmrsIDUuid,
              location: session.sessionLocation.uuid,
            },
          ],
          person: {
            names: [{ givenName, middleName, familyName }],
            gender,
            birthdate,
            addresses: address ? [{ preferred: true, address1: address }] : undefined,
            dead: false,
            attributes: [
              ...(phoneNumber
                ? [
                    {
                      attributeType: config.contactPersonAttributesUuid.telephone,
                      value: phoneNumber,
                    },
                  ]
                : []),
              ...extraAttributes,
            ],
          },
        }),
      });
      patient = response.data?.uuid;
      showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Patient created succesfully' });
    } catch (error) {
      showSnackbar({ title: 'Error creating patient', kind: 'error', subtitle: error?.message });
      throw error; // Don't contunue if an erro ocuures
    }
  }

  // Hanldle add personB attributes if search mode
  if (data.mode === 'search' && extraAttributes.length > 0) {
    const results = await Promise.allSettled(
      extraAttributes.map((attr) =>
        openmrsFetch(`${restBaseUrl}/person/${patient}/attribute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attr,
          }),
        }),
      ),
    );
    results.forEach((res) => {
      if (res.status === 'rejected') {
        return showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error creating patient attribute' });
      }
    });
  }

  // Handle storage of patient demographics in obs
  if (data.mode === 'create' && data.personBInfo?.maritalStatus) {
    try {
      await openmrsFetch(`/ws/rest/v1/encounter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: session.sessionLocation.uuid,
          encounterProviders: [
            {
              provider: session.currentProvider.uuid,
              encounterRole: config.registrationObs.encounterProviderRoleUuid,
            },
          ],
          form: config.registrationObs.registrationFormUuid,
          encounterType: config.registrationEncounterUuid,
          patient: patient,
          obs: [{ concept: config.maritalStatusUuid, value: data.personBInfo.maritalStatus }],
        }),
      });
      showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Patient Demographics saved succesfuly' });
    } catch (error) {
      showSnackbar({ title: 'Error saving patient demographics', kind: 'error', subtitle: error?.message });
    }
  }

  // Handle Relationship Creation
  try {
    await openmrsFetch(`/ws/rest/v1/relationship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...omit(data, ['personBInfo', 'mode']),
        personB: patient,
      }),
    });
    showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Relationship saved succesfully' });
    mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/relationship'));
  } catch (error) {
    showSnackbar({ title: 'Error saving relationship', kind: 'error', subtitle: error?.message });
    throw error;
  }
};
