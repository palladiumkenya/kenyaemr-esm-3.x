import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { PatientInfo } from '../types';

// Function to update an existing person attribute
export const updatePersonAttributes = (payload, personUuid: string, attributeUuid: string) => {
  const url = `${restBaseUrl}/person/${personUuid}/attribute/${attributeUuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createPersonAttribute = (payload, personUuid: string) => {
  const url = `${restBaseUrl}/person/${personUuid}/attribute`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createOrUpdatePersonAttribute = async (
  personUuid: string,
  payload: { attributeType: string; value: string },
  person: PatientInfo,
) => {
  const { attributeType, value } = payload;

  const existingAttribute = person.attributes.find((attr) => attr.uuid === attributeType);

  if (existingAttribute) {
    const updatePayload = {
      attributeType: existingAttribute.uuid,
      value: value,
    };
    return updatePersonAttributes(updatePayload, personUuid, existingAttribute.uuid);
  } else {
    const createPayload = {
      attributeType: attributeType,
      value: value,
    };
    return createPersonAttribute(createPayload, personUuid);
  }
};
