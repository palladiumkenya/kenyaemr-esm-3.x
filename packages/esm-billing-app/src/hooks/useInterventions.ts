import React, { useMemo } from 'react';
import { intervensions, patientBenefits } from '../benefits-package/benefits-package.mock';
import useSWR from 'swr';
import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { SHAIntervension } from '../types';

const useInterventions = (category: string) => {
  const url = `https://payers.apeiro-digital.com/api/master/benefit-master/intervention-name/having?name=${category
    .split(' ')
    .at(0)}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Array<SHAIntervension>>>(url, openmrsFetch);
  return {
    isLoading,
    interventions: data?.data ?? [],
    error,
  };
};

export default useInterventions;
