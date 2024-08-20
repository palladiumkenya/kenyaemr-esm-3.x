import useSWR from 'swr';
import {
  formatDate,
  parseDate,
  openmrsFetch,
  useSession,
  useVisit,
  useConfig,
  OpenmrsResource,
} from '@openmrs/esm-framework';
import { FacilityDetail, MappedBill, PatientInvoice, PaymentMethod } from './types';
import isEmpty from 'lodash-es/isEmpty';
import sortBy from 'lodash-es/sortBy';
import dayjs from 'dayjs';
import { BillingConfig } from './config-schema';
import { useState } from 'react';

export const useBills = (patientUuid: string = '', billStatus: string = '') => {
  // TODO: Should be provided from the UI
  const defaultCreatedOnOrAfterDateTime = dayjs().startOf('day').toISOString();
  const url = `/ws/rest/v1/cashier/bill?status=${billStatus}&v=custom:(uuid,display,voided,voidReason,adjustedBy,cashPoint:(uuid,name),cashier:(uuid,display),dateCreated,lineItems,patient:(uuid,display))&createdOnOrAfter=${defaultCreatedOnOrAfterDateTime}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    patientUuid ? `${url}&patientUuid=${patientUuid}` : url,
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

  const sortBills = sortBy(data?.data?.results ?? [], ['dateCreated']).reverse();
  const filteredBills = billStatus === '' ? sortBills : sortBills?.filter((bill) => bill.status === billStatus);
  const mappedResults = filteredBills?.map((bill) => mapBillProperties(bill));
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

export const useInterventions = (searchString: string = '') => {
  const url = `/ws/rest/v1/cashier/interventions?q=${searchString}`;
  const { data, error, isLoading } = useSWR(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const results = [
    {
      shaPackageCode: 'SHA-001',
      shaPackageName: 'Eye Care',
      shaInterventionCode: 'SHA-001-01',
      shaInterventionName: 'Treatment and Diagnosis',
      shaInterventioTariff: 50000,
      requirePreauth: true,
    },
    {
      shaPackageCode: 'SHA-001',
      shaPackageName: 'Eye Care',
      shaInterventionCode: 'SHA-001-01',
      shaInterventionName: 'X-ray Services',
      shaInterventioTariff: 50000,
      requirePreauth: true,
    },
    {
      shaPackageCode: 'SHA-001',
      shaPackageName: 'Eye Care',
      shaInterventionCode: 'SHA-001-01',
      shaInterventionName: 'Clinical Consultation',
      shaInterventioTariff: 50000,
      requirePreauth: false,
    },
    {
      shaPackageCode: 'SHA-001',
      shaPackageName: 'Eye Care',
      shaInterventionCode: 'SHA-001-01',
      shaInterventionName: 'Test Test',
      shaInterventioTariff: 50000,
      requirePreauth: true,
    },
  ];
  return data ? results : results;
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
      dateCreated: bill?.dateCreated ?? '--',
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

export const usePaymentModes = (excludeWaiver: boolean = true) => {
  const { excludedPaymentMode } = useConfig<BillingConfig>();
  const url = `/ws/rest/v1/cashier/paymentMode`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<PaymentMethod> } }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  const allowedPaymentModes =
    excludedPaymentMode?.length > 0
      ? data?.data?.results.filter((mode) => !excludedPaymentMode.some((excluded) => excluded.uuid === mode.uuid)) ?? []
      : data?.data?.results ?? [];
  return {
    paymentModes: excludeWaiver ? allowedPaymentModes : data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

export const useBillableItems = () => {
  const url = `/ws/rest/v1/cashier/billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(display),servicePrices:(uuid,name,price,paymentMode))`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredItems =
    data?.data?.results?.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];
  return {
    lineItems: filteredItems,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
  };
};
export const useCashPoint = () => {
  const url = `/ws/rest/v1/cashier/cashPoint`;
  const { data, isLoading, error } = useSWR<{ data: { results: Array<OpenmrsResource> } }>(url, openmrsFetch);

  return { isLoading, error, cashPoints: data?.data?.results ?? [] };
};

export const createPatientBill = (payload) => {
  const postUrl = `/ws/rest/v1/cashier/bill`;
  return openmrsFetch(postUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
};

export const useConceptAnswers = (conceptUuid: string) => {
  const url = `/ws/rest/v1/concept/${conceptUuid}`;
  const { data, isLoading, error } = useSWR<{ data: { answers: Array<OpenmrsResource> } }>(url, openmrsFetch);
  return { conceptAnswers: data?.data?.answers, isLoading, error };
};
