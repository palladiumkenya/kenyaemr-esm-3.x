import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export type FacilityClaim = {
  uuid: string;
  claimCode: string;
  dateFrom: string;
  dateTo: string;
  claimedTotal: number;
  approvedTotal: null;
  status: 'REJECTED' | 'ENTERED' | 'CHECKED' | 'VALUATED' | 'ERRORED';
  provider: {
    display: string;
  } | null;
  externalId: string;
};

export const useFacilityClaims = () => {
  const customPresentation =
    'custom:(uuid,claimCode,dateFrom,dateTo,claimedTotal,approvedTotal,status,externalId,provider:(display),)';
  const url = `${restBaseUrl}/claim?v=${customPresentation}`;

  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<FacilityClaim> }>>(url, openmrsFetch);

  return {
    claims:
      data?.data.results.map((claim) => {
        return {
          ...claim,
          providerName: claim.provider?.display,
          approvedTotal: claim.approvedTotal ?? 0,
          status:
            claim.status !== 'ENTERED' && claim.status !== 'ERRORED'
              ? `${claim.status} - ${claim.externalId}`
              : claim.status,
          id: claim.uuid,
        };
      }) ?? [],
    error,
    isLoading,
  };
};
