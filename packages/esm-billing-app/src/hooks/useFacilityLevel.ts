import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import React from 'react';
import useSWR from 'swr';

const useFacilityLevel = () => {
  const url = `${restBaseUrl}/kenyaemr/default-facility`;
  const { data, isLoading, error } = useSWR<FetchResponse<{ shaKephLevel: string }>>(url, openmrsFetch);
  return {
    isLoading,
    error,
    level: data?.data?.shaKephLevel,
  };
};

export default useFacilityLevel;
