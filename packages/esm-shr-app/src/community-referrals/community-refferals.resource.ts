import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { CommunityReferral } from '../types';

export const useCommunityReferrals = (status: string) => {
  const shrSummaryUrl = `/ws/rest/v1/kenyaemril/communityReferrals?status=${status}`;
  const { data, mutate, error, isLoading, isValidating } = useSWR<{ data: Array<CommunityReferral> }>(
    shrSummaryUrl,
    openmrsFetch,
  );

  return {
    referrals: data?.data ?? [],
    isError: error,
    isLoading: isLoading,
    isValidating,
  };
};

export const processCommunityReferral = (id: number) => {
  const url = `/ws/rest/v1/kenyaemril/serveReferredClient`;
  return openmrsFetch(url, {
    method: 'POST',
    body: { referralMessageId: id },
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export async function pullFacilityReferrals() {
  const abortController = new AbortController();
  return openmrsFetch(`/ws/rest/v1/kenyaemril/pullShrReferrals`, {
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
  });
}
