import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import React from 'react';
import useSWR from 'swr';

const useIsKDoDSite = () => {
  const key = 'kenyaemr.isKDoD';
  const customeRep = 'custom:(property,value)';
  const url = `${restBaseUrl}/systemsetting?v=${customeRep}&q=${key}`;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<{ property: string; value: string }> }>>(
    url,
    openmrsFetch,
  );
  return { isKDoDSite: data?.data?.results?.find((res) => res?.property === key)?.value === 'true', isLoading, error };
};

export default useIsKDoDSite;
