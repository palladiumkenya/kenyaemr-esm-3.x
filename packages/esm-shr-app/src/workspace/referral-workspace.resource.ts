import { openmrsFetch, OpenmrsResource, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { FacilityResponse, ReasonResponse, ReferralError, ReferralPayload, ReferralResponse } from '../types';
import { ReferralConfigObject } from '../config-schema';

export const useReasons = (searchTerm: string) => {
  const customRepresentation = 'custom:(uuid,name:(name))';
  const url = `/ws/rest/v1/concept?v=${customRepresentation}&q=${searchTerm}&limit=15`;
  const { data, error } = useSWRImmutable<{ data: ReasonResponse }>(searchTerm ? url : null, openmrsFetch);

  return { data: data?.data?.results, error };
};

export const useFacilities = (searchTerm: string) => {
  const customRepresentation = 'custom:(uuid,name,attributes:(value))';
  const url = `/ws/rest/v1/location?v=${customRepresentation}&q=${searchTerm}&limit=15`;
  const { data, error } = useSWRImmutable<{ data: FacilityResponse }>(searchTerm ? url : null, openmrsFetch);

  return { data: data?.data?.results, error };
};

export const useSendReferralToArtDirectory = () => {
  const { artDirectoryUrl } = useConfig<ReferralConfigObject>();

  const sendReferral = async (apiPayload: ReferralPayload): Promise<ReferralResponse> => {
    try {
      const response = await openmrsFetch(artDirectoryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error: ReferralError = new Error(
          `Failed to send referral: ${response.status} ${response.statusText}. ${errorText}`,
        );
        error.status = response.status;
        error.statusText = response.statusText;
        error.responseBody = errorText;
        throw error;
      }

      return {
        success: true,
        data: await response.json(),
        payload: apiPayload,
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      const networkError: ReferralError = new Error(
        `Network error while sending referral: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw networkError;
    }
  };

  return { mutate: sendReferral };
};

export function useSystemSetting(key: string) {
  const { data, isLoading } = useSWRImmutable<{ data: { results: Array<OpenmrsResource> } }>(
    `${restBaseUrl}systemsetting?q=${key}&v=full`,
    openmrsFetch,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const mflCodeResource = data?.data?.results?.find((resource) => resource.property === 'facility.mflcode');
  const mflCodeValue = mflCodeResource?.value;

  return { mflCodeValue, isLoading };
}
