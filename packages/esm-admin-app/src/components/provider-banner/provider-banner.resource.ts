import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface ProviderAttributesResponse {
  person: Person;
  attributes: Array<Attribute>;
}

export interface Person {
  display: string;
}

export interface Attribute {
  attributeType: AttributeType;
  value: string;
}

export interface AttributeType {
  display: string;
}

export const useProviderAttributes = (uuid: string) => {
  const customRepresentation = 'custom:(person:(display),attributes:(attributeType:(display),value))';
  const url = `${restBaseUrl}/provider/${uuid}?v=${customRepresentation}`;

  const { isLoading, error, data } = useSWR<FetchResponse<ProviderAttributesResponse>>(url, openmrsFetch);
  const providerAttributes = data?.data;
  return { isLoading, error, providerAttributes };
};
