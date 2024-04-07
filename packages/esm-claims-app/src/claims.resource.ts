import useSWR from 'swr';
import { formatDate, parseDate, openmrsFetch, useSession, useVisit } from '@openmrs/esm-framework';
import { FacilityDetail, MappedBill, PatientInvoice } from './types';
import isEmpty from 'lodash-es/isEmpty';
import sortBy from 'lodash-es/sortBy';

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
  // Filter the data where status is 'PENDING'
  const filteredData = data.filter((item) => item.status === 'PENDING');
  return filteredData;
};

export const useBills = (patientUuid: string = '', billStatus: string = '') => {
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
      status: bill.lineItems.some((item) => item.paymentStatus === 'PENDING') ? 'PENDING' : 'PAID',
      receiptNumber: bill?.receiptNumber,
      cashier: bill?.cashier,
      cashPointUuid: bill?.cashPoint?.uuid,
      cashPointName: bill?.cashPoint?.name,
      cashPointLocation: bill?.cashPoint?.location?.display,
      dateCreated: bill?.dateCreated ? formatDate(parseDate(bill.dateCreated), { mode: 'wide' }) : '--',
      lineItems: bill.lineItems,
      billingService: bill.lineItems.map((bill) => bill.item || bill.billableService || '--').join('  '),
      payments: bill.payments,
      display: bill.display,
      totalAmount: bill?.lineItems?.map((item) => item.price * item.quantity).reduce((prev, curr) => prev + curr, 0),
    };

    return mappedBill;
  };

  // const filteredData = data.filter(item => item.status === 'PENDING');
  const sortBills = sortBy(data?.data?.results ?? [], ['dateCreated']).reverse();
  const filteredBills = billStatus === '' ? sortBills : sortBills?.filter((bill) => bill.status === billStatus);
  const mappedResults = filteredBills?.map((bill) => mapBillProperties(bill));
  const filteredResults = mappedResults?.filter((res) => res.patientUuid === patientUuid);
  const formattedBills = isEmpty(patientUuid) ? mappedResults : filteredResults || [];
  const filteredData = formattedBills?.filter((item) => item.status === 'PENDING');

  return {
    // bills: formattedBills,
    bills: filteredData,
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
      status:
        bill.lineItems.length > 1
          ? bill.lineItems.some((item) => item.paymentStatus === 'PENDING')
            ? 'PENDING'
            : 'PAID'
          : bill.status,
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

export function useFetchSearchResults(searchVal, category) {
  let url = ``;
  if (category == 'Stock Item') {
    url = `/ws/rest/v1/stockmanagement/stockitem?v=default&limit=10&q=${searchVal}`;
  } else {
    url = `/ws/rest/v1/cashier/billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(display),servicePrices:(uuid,name,price,paymentMode))`;
  }
  const { data, error, isLoading, isValidating } = useSWR(searchVal ? url : null, openmrsFetch, {});

  return { data: data?.data, error, isLoading: isLoading, isValidating };
}

export const usePatientPaymentInfo = (patientUuid: string) => {
  const { currentVisit } = useVisit(patientUuid);
  const attributes = currentVisit?.attributes ?? [];
  const paymentInformation = attributes
    .map((attribute) => ({
      name: attribute.attributeType.name,
      value: attribute.value,
    }))
    .filter(({ name }) => name === 'Insurance scheme' || name === 'Policy Number');

  return paymentInformation;
};

export const processBillItems = (payload) => {
  const url = `/ws/rest/v1/cashier/bill`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
