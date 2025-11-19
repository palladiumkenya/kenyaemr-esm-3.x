import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FacilityClaim } from '../../../types';

export const useFacilityClaims = () => {
  const customPresentation = 'default';
  const url = `${restBaseUrl}/claim?v=${customPresentation}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR<FetchResponse<{ results: Array<FacilityClaim> }>>(
    url,
    openmrsFetch,
  );

  const formatClaim = (
    claim: FacilityClaim,
  ): FacilityClaim & {
    id: string;
    providerName: string;
    patientName: string;
    patientId?: string;
    visitType?: { uuid: string; display: string };
  } => ({
    ...claim,
    id: claim.uuid,
    providerName: claim.provider?.person?.display || '',
    approvedTotal: claim.approvedTotal ?? 0,
    status: claim.status,
    patientName: claim.patient?.display || '',
    insurer: claim.insurer ?? '',
    patientId: claim.patient?.uuid,
    visitType: claim.visitType,
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
