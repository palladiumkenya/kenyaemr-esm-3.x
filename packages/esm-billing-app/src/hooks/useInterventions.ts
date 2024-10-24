import React, { useMemo } from 'react';
import { intervensions, patientBenefits } from '../benefits-package/benefits-package.mock';
import useSWR from 'swr';
import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { _SHAIntervension, SHAIntervension } from '../types';

const useInterventions = (code: string) => {
  const url = `https://payers.apeiro-digital.com/api/master/benefit-master/code?searchKey=${code}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Array<SHAIntervension>>>(url, openmrsFetch);
  return {
    isLoading,
    interventions: data?.data ?? [],
    error,
  };
};

export default useInterventions;
