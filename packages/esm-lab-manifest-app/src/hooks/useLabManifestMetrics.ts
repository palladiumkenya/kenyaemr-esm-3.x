import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import React from 'react';
import useSWR from 'swr';
import { ManifestMetrics } from '../types';

const statusMapper = {
  manifestsDraft: 'Draft',
  manifestsOnHold: 'On Hold',
  manifestsReadyToSend: 'Ready to send',
  manifestsSending: 'Sending',
  manifestsSubmitted: 'Submitted',
  errorsOnIncomplete: 'Incomplete errors', //out of incomplete with errors, which ones had errors
  manifestsIncompleteWithErrors: 'Incomplete errors',
  manifestsIncomplete: 'Incomplete results',
  manifestsCompleteWithErrors: 'Complete errors',
  errorsOnComplete: 'Complete errors', // Out of complete with errors, h
  manifestsComplete: 'Complete results',
};

const useLabManifestMetrics = () => {
  const url = `${restBaseUrl}/kemrorder/manifestmetrics`;
  const { isLoading, data, error } = useSWR<FetchResponse<ManifestMetrics>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    metrics: data?.data ?? null,
    statusAggregates: (status: Array<string>) => {
      let aggregates = 0;
      status.forEach((status) => {
        aggregates += data?.data?.[Object.entries(statusMapper).find(([key, value]) => value === status)[0]] ?? 0;
      });
      return aggregates;
    },
  };
};

export default useLabManifestMetrics;
