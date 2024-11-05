import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FacilityClaim } from '../../../types';

export const useFacilityClaims = () => {
  const customPresentation =
    'custom:(uuid,claimCode,dateFrom,dateTo,claimedTotal,approvedTotal,status,externalId,provider:(display),patient:(display))';
  const url = `${restBaseUrl}/claim?v=${customPresentation}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR<FetchResponse<{ results: Array<FacilityClaim> }>>(
    url,
    openmrsFetch,
  );

  const formatClaim = (
    claim: FacilityClaim,
  ): FacilityClaim & { id: string; providerName: string; patientName: string } => ({
    ...claim,
    id: claim.uuid,
    providerName: claim.provider?.display,
    approvedTotal: claim.approvedTotal ?? 0,
    status: claim.status,
    patientName: claim.patient?.display,
  });

  const formattedClaims = data?.data.results.map(formatClaim) ?? [];

  return {
    claims: formattedClaims,
    error,
    isLoading,
    mutate,
    isValidating,
  };
};
