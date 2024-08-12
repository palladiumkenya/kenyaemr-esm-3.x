import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import React from 'react';
import useSWR from 'swr';
import { ManifestMetrics, MappedManifestMetrics } from '../types';

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

const extractStatusMetrics = (metric: ManifestMetrics) => {
  return {
    Draft: metric.manifestsDraft,
    'On Hold': metric.manifestsOnHold,
    'Ready to send': metric.manifestsReadyToSend,
    Sending: metric.manifestsSending,
    Submitted: metric.manifestsSubmitted,
    'Complete errors': metric.errorsOnComplete,
    'Complete results': metric.manifestsComplete,
    'Incomplete errors': metric.errorsOnIncomplete,
    'Incomplete results': metric.manifestsIncomplete,
    summaryGraph: metric.summaryGraph,
    userHasSettingsEditRole: metric.userHasSettingsEditRole,
  } as MappedManifestMetrics;
};

const useLabManifestMetrics = () => {
  const url = `${restBaseUrl}/kemrorder/manifestmetrics`;
  const { isLoading, data, error, isValidating } = useSWR<FetchResponse<ManifestMetrics>>(url, openmrsFetch);
  const _data = data?.data ? extractStatusMetrics(data!.data!) : null;

  return {
    isLoading,
    error,
    metrics: _data,
    statusAggregates: (status: Array<string>) => {
      let aggregates = 0;
      status.forEach((status) => {
        aggregates += _data?.[status] ?? 0;
      });
      return aggregates;
    },
  };
};

export default useLabManifestMetrics;
