import { useMemo } from 'react';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface Claim {
  uuid: string;
  claimCode: string;
  dateFrom: string | null;
  dateTo: string | null;
  claimedTotal: number;
  approvedTotal: number;
  status: string;
  externalId?: string;
}

interface ClaimResponse {
  results: Claim[];
}

const useClaimsAggregate = () => {
  const { data, error, isValidating } = useSWR<ClaimResponse>(
    `${restBaseUrl}/claim?v=custom:(uuid,claimCode,dateFrom,dateTo,claimedTotal,approvedTotal,status,externalId)`,
    async (url) => {
      const response = await openmrsFetch<ClaimResponse>(url);
      return response.data;
    },
  );

  const summarizedData = useMemo(() => {
    if (!data || !data.results) {
      return [];
    }

    const summary = data.results.reduce((acc, item) => {
      const date = item.dateFrom || item.dateTo;
      const month = new Date(date ?? '').toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      if (!acc[month]) {
        acc[month] = { claimedTotal: 0, approvedTotal: 0 };
      }

      acc[month].claimedTotal += item.claimedTotal || 0;
      acc[month].approvedTotal += item.approvedTotal || 0;

      return acc;
    }, {} as Record<string, { claimedTotal: number; approvedTotal: number }>);

    return Object.entries(summary).map(([month, totals], index) => ({
      id: `${index + 1}`,
      month,
      claimedTotal: totals.claimedTotal,
      approvedTotal: totals.approvedTotal,
    }));
  }, [data]);

  return {
    isLoading: isValidating,
    error,
    summarizedData,
  };
};

export default useClaimsAggregate;
