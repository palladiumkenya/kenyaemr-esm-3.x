import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { SHRSummary } from '../types/index';
import { useState } from 'react';

export const useSHRSummary = (patientUuid: string) => {
  // const shrSummaryUrl = `/ws/rest/v1/kenyaemril/shrPatientSummary?patientUuid=${patientUuid}`;
  // const { data, mutate, error, isLoading } = useSWR<{ data: SHRSummary }>(shrSummaryUrl, openmrsFetch);
  // return {
  //   data: data?.data ? data?.data : null,
  //   isError: undefined,
  //   isLoading: isLoading,
  // };
  const [state, setState] = useState({ isError: undefined, isLoading: true, data: require('./visits.json') });

  setTimeout(() => {
    setState({ ...state, isLoading: false });
  }, 3000);

  return state;
};

export const useCommunityReferrals = (status: string) => {
  const shrSummaryUrl = `/ws/rest/v1/kenyaemril/communityReferrals?status=${status}`;
  const { data, mutate, error, isLoading } = useSWR<{ data: SHRSummary }>(shrSummaryUrl, openmrsFetch);

  return {
    data: data?.data ? data?.data : null,
    isError: error,
    isLoading: isLoading,
  };
};
