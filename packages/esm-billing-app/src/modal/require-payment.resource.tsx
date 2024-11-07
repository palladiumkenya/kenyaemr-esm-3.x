import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { PatientInvoice } from '../types';
import useSWR from 'swr';
import { useMemo } from 'react';
import { mapBillProperties } from '../billing.resource';
import { config } from 'rxjs';
/*
 Custom hook to fetch patient bills
 @param patientUuid - The UUID of the patient
 @returns {
    patientBills: Array<PatientInvoice>,
    isLoading: boolean,
    error: Error,
    isValidating: boolean,
    mutate: () => void
 }
*/
export const usePatientBills = (patientUuid: string) => {
  const { patientBillsUrl } = useConfig();
  const url = patientBillsUrl.replace('${restBaseUrl}', restBaseUrl);
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    patientUuid ? `${url}&patientUuid=${patientUuid}` : url,
    openmrsFetch,
    {
      errorRetryCount: 2,
    },
  );

  const patientBills = useMemo(() => {
    return data?.data?.results?.map(mapBillProperties) ?? [];
  }, [data?.data?.results]);

  return {
    patientBills: patientBills ?? [],
    isLoading,
    error,
    isValidating,
    mutate,
  };
};
