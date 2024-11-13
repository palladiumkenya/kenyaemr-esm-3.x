import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { PatientInvoice, PaymentStatus } from '../types';
import useSWR from 'swr';
import { useMemo } from 'react';
import { mapBillProperties } from '../billing.resource';
import { BillingConfig } from '../config-schema';
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
  const { patientBillsUrl } = useConfig<BillingConfig>();
  const url = patientBillsUrl.replace('${restBaseUrl}', restBaseUrl);
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    patientUuid ? `${url}&patientUuid=${patientUuid}&includeVoided=false` : url,
    openmrsFetch,
    {
      errorRetryCount: 2,
    },
  );

  // filter out adjusted bills and whose line items are paid
  const filteredBills = data?.data?.results
    ?.filter((bill) => bill.lineItems.every((li) => li.paymentStatus !== PaymentStatus.PAID))
    .filter((bill) => bill.status !== PaymentStatus.PAID);

  const patientBills = useMemo(() => {
    return filteredBills?.map(mapBillProperties) ?? [];
  }, [filteredBills]);

  return {
    patientBills: patientBills ?? [],
    isLoading,
    error,
    isValidating,
    mutate,
  };
};
