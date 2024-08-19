import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

type HIEAPIResponse = {
  insurer: string;
  inforce: boolean;
  start: string;
  end: string;
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
