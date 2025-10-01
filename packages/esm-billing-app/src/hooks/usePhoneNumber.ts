import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../config-schema';

interface PersonAttribute {
  uuid: string;
  value: string;
  attributeType?: {
    uuid: string;
    display: string;
  };
}

interface PersonAttributeResponse {
  results: PersonAttribute[];
}

export const usePhoneNumberAttribute = (patientUuid: string) => {
  const url = `${restBaseUrl}/person/${patientUuid}/attribute?v=custom:(uuid,value,attributeType:(uuid,display))`;
  const { phoneNumberAttributeTypeUUID } = useConfig<BillingConfig>();

  const { data, isLoading, error } = useSWR<{ data: PersonAttributeResponse }>(patientUuid ? url : null, openmrsFetch);

  const phoneNumberAttribute = data?.data?.results?.find(
    (attr) => attr.uuid === phoneNumberAttributeTypeUUID || attr.attributeType?.uuid === phoneNumberAttributeTypeUUID,
  );

  return {
    attribute: phoneNumberAttribute,
    phoneNumber: phoneNumberAttribute?.value || null,
    isLoading,
    error,
    allAttributes: data?.data?.results,
  };
};
