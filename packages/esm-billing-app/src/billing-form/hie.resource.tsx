import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

type EligibilityResponse = { message: { eligible: 0 | 1; possible_solution: string; reason: string } };

type HIEEligibilityResponse = {
  // TODO
  eligibility_response: EligibilityResponse;
};

type HIEAPIResponse = {
  insurer: string;
  inforce: boolean;
  start: string;
  end: string;
};

export const useHIEEligibility = (patientUuid: string) => {
  const url = `${restBaseUrl}/insuranceclaims/CoverageEligibilityRequest?patientUuid=${patientUuid}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: Array<HIEEligibilityResponse> }>(url, openmrsFetch, {
    errorRetryCount: 0,
  });

  return {
    data: [],
    // data:
    //   data?.data.map((d) => {
    //     return {
    //       ...d,
    //       eligibility_response: JSON.parse(d.eligibility_response as unknown as string) as EligibilityResponse,
    //     };
    //   }) ?? [],
    isLoading,
    error,
    mutate,
  };
};

export const useHIESubscription = (patientUuid: string) => {
  const url = `${restBaseUrl}/insuranceclaims/CoverageEligibilityRequest?patientUuid=${patientUuid}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: Array<HIEAPIResponse> }>(url, openmrsFetch, {
    errorRetryCount: 0,
  });

  return {
    hieSubscriptions: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
};
