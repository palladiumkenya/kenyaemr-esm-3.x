import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

// TODO find the correct auth request
export type PreAuthRequest = {};

export const usePreAuthRequests = (patientUuid: string) => {
  // TODO correct url
  const url = ``;

  const { data, error, isLoading } = useSWR<{ data: Array<PreAuthRequest> }>(url, openmrsFetch);

  return {
    preAuthRequests: data?.data ?? [],
    error,
    isLoading,
  };
};
