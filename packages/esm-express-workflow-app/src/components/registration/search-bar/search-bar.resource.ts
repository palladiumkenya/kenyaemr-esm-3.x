import { useMemo } from 'react';
import { FetchResponse, makeUrl, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type EligibilityResponse, type HIEEligibilityResponse, type LocalPatientApiResponse } from '../type';
import { PATIENT_API_NO_CREDENTIALS, PATIENT_NOT_FOUND, RESOURCE_NOT_FOUND, UNKNOWN } from '../constant';

export const searchPatientFromHIE = async (identifierType: string, searchQuery: string) => {
  const url = `${restBaseUrl}/kenyaemr/getSHAPatient/${searchQuery}/${identifierType}`;
  const response = await fetch(makeUrl(url));
  if (response.ok) {
    const responseData = await response.json();
    if (responseData?.issue) {
      throw new Error(PATIENT_NOT_FOUND);
    }
    return responseData;
  }
  if (response.status === 401) {
    throw new Error(PATIENT_API_NO_CREDENTIALS);
  } else if (response.status === 404) {
    throw new Error(RESOURCE_NOT_FOUND);
  }
  throw new Error(UNKNOWN);
};

export const usePatient = (searchQuery: string) => {
  const customRepresentation =
    'custom:(patientId,uuid,identifiers,display,patientIdentifier:(uuid,identifier),person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),attributes:(value,attributeType:(uuid,display)))';
  const url = `${restBaseUrl}/patient?q=${searchQuery}&v=${customRepresentation}`;

  const { isLoading, error, data } = useSWR<FetchResponse<LocalPatientApiResponse>>(
    searchQuery ? url : null,
    openmrsFetch,
  );

  const patient = data?.data?.results || null;

  return { patient, isLoading, error };
};

export const useSHAEligibility = (nationalId: string) => {
  const url =
    nationalId && nationalId.trim().length > 0
      ? `${restBaseUrl}/insuranceclaims/CoverageEligibilityRequest?nationalId=${nationalId}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<{ data: Array<HIEEligibilityResponse> }>(url, openmrsFetch);

  const processedData = useMemo(() => {
    if (!data?.data?.length) {
      return undefined;
    }

    const eligibilityResponse = data.data[0]?.eligibility_response;

    if (typeof eligibilityResponse === 'string') {
      try {
        return JSON.parse(eligibilityResponse) as EligibilityResponse;
      } catch (e) {
        return undefined;
      }
    }

    return eligibilityResponse as EligibilityResponse;
  }, [data]);

  return {
    data: processedData,
    isLoading,
    error,
    mutate,
  };
};
