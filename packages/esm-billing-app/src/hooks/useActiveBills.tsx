import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { MappedBill, PatientInvoice } from '../types';

export const useActiveBills = () => {
  const url = `/ws/rest/v1/cashier/bill?v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    url,
    openmrsFetch,
    {
      errorRetryCount: 2,
    },
  );

  const mapBillProperties = (bill: PatientInvoice): MappedBill => {
    // create base object
    const mappedBill: MappedBill = {
      id: bill?.id,
      uuid: bill?.uuid,
      patientName: bill?.patient?.display.split('-')?.[1],
      identifier: bill?.patient?.display.split('-')?.[0],
      patientUuid: bill?.patient?.uuid,
      status: bill?.status,
      receiptNumber: bill?.receiptNumber,
      cashierName: bill?.cashier?.display,
      cashPointUuid: bill?.cashPoint?.uuid,
      cashPointName: bill?.cashPoint?.name,
      cashPointLocation: bill?.cashPoint?.location?.display,
      totalPrice: bill.id,
    };

    return mappedBill;
  };

  const formattedBills = data?.data ? data?.data?.results?.map((res) => mapBillProperties(res)) : [];

  return {
    activeBills: formattedBills,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};
