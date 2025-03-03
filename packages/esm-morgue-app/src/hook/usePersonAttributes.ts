import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { Patient, PatientInfo } from '../types';
import useSWR from 'swr';

export const usePersonAttributes = (personUuid: string) => {
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Patient['person']['attributes'] }>>(
    personUuid ? `${restBaseUrl}/person/${personUuid}/attribute` : null,
    openmrsFetch,
  );

  const updatePersonAttributes = async (
    payload: { attributeType: string; value: string },
    personUuid: string,
    attributeUuid: string,
  ) => {
    const url = `${restBaseUrl}/person/${personUuid}/attribute/${attributeUuid}`;
    return openmrsFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const createPersonAttribute = async (payload: { attributeType: string; value: string }, personUuid: string) => {
    const url = `${restBaseUrl}/person/${personUuid}/attribute`;
    return openmrsFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const createOrUpdatePersonAttribute = async (
    personUuid: string,
    payload: { attributeType: string; value: string },
    person: PatientInfo,
  ) => {
    const { attributeType, value } = payload;

    const existingAttribute = person.attributes.find((attr) => attr.uuid === attributeType);

    if (existingAttribute) {
      return updatePersonAttributes(
        { attributeType: existingAttribute.uuid, value },
        personUuid,
        existingAttribute.uuid,
      );
    } else {
      return createPersonAttribute({ attributeType, value }, personUuid);
    }
  };

  return {
    personAttributes: data?.data?.results ?? [],
    error,
    isLoading,
    updatePersonAttributes,
    createPersonAttribute,
    createOrUpdatePersonAttribute,
  };
};
