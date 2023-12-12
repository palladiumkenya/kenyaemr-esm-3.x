import useSWR from 'swr';
import { formatDate, parseDate, openmrsFetch, useSession, OpenmrsResource } from '@openmrs/esm-framework';
import { FacilityDetail, MappedBill, PatientInvoice } from './types';
import isEmpty from 'lodash-es/isEmpty';

export const useBills = (patientUuid?: string) => {
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
      cashier: bill?.cashier,
      cashPointUuid: bill?.cashPoint?.uuid,
      cashPointName: bill?.cashPoint?.name,
      cashPointLocation: bill?.cashPoint?.location?.display,
      dateCreated: bill?.dateCreated ? formatDate(parseDate(bill.dateCreated), { mode: 'wide' }) : '--',
      lineItems: bill.lineItems,
      billingService: bill.lineItems.map((bill) => bill.item).join(' & '),
      payments: bill.payments,
      totalAmount: bill?.lineItems?.map((item) => item.price * item.quantity).reduce((prev, curr) => prev + curr, 0),
    };

    return mappedBill;
  };

  const mappedResults = data?.data ? data?.data?.results?.map((res) => mapBillProperties(res)) : [];
  const filteredResults = mappedResults?.filter((res) => res.patientUuid === patientUuid);
  const formattedBills = isEmpty(patientUuid) ? mappedResults : filteredResults || [];

  return {
    bills: formattedBills,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const useBill = (billUuid: string) => {
  const url = `/ws/rest/v1/cashier/bill/${billUuid}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: PatientInvoice }>(
    billUuid ? url : null,
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
      cashier: bill?.cashier,
      cashPointUuid: bill?.cashPoint?.uuid,
      cashPointName: bill?.cashPoint?.name,
      cashPointLocation: bill?.cashPoint?.location?.display,
      dateCreated: bill?.dateCreated ? formatDate(parseDate(bill.dateCreated), { mode: 'wide' }) : '--',
      lineItems: bill.lineItems,
      billingService: bill.lineItems.map((bill) => bill.item).join(' '),
      payments: bill.payments,
      totalAmount: bill?.lineItems?.map((item) => item.price * item.quantity).reduce((prev, curr) => prev + curr, 0),
      tenderedAmount: bill?.payments?.map((item) => item.amountTendered).reduce((prev, curr) => prev + curr, 0),
    };

    return mappedBill;
  };

  const formattedBill = data?.data ? mapBillProperties(data?.data) : ({} as MappedBill);

  return {
    bill: formattedBill,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const processBillPayment = (payload, billUuid: string) => {
  const url = `/ws/rest/v1/cashier/bill/${billUuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export function useDefaultFacility() {
  const { authenticated } = useSession();
  const url = '/ws/rest/v1/kenyaemr/default-facility';
  const { data, isLoading } = useSWR<{ data: FacilityDetail }>(authenticated ? url : null, openmrsFetch, {});
  return { data: data?.data, isLoading: isLoading };
}
