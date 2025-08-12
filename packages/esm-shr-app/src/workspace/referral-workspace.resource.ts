import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { FacilityResponse, ReasonResponse, ReferralError, ReferralPayload, ReferralResponse } from '../types';

export const useReasons = (searchTerm: string) => {
  const customRepresentation = 'custom:(uuid,name)';
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

export const sendReferralToArtDirectory = async (apiPayload: ReferralPayload): Promise<ReferralResponse> => {
  try {
    const response = await openmrsFetch('https://art.kenyahmis.org/api/patients', {
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

    const responseData = await response.json();

    return {
      success: true,
      data: responseData,
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
