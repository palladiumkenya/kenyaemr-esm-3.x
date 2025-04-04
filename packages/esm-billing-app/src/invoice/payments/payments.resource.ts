import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';

type PaymentMethod = {
  uuid: string;
  description: string;
  name: string;
  retired: boolean;
};

const swrOption = {
  errorRetryCount: 2,
};

export interface PaymentStatusResponse {
  success: boolean;
  message: string;
  data?: Data;
}

export interface Data {
  id: number;
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber: any;
  OrgAccountBalance: string;
  ThirdPartyTransID: any;
  MSISDN: string;
  FirstName: string;
  MiddleName: any;
  LastName: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export const usePaymentModes = () => {
  const { excludedPaymentMode } = useConfig<BillingConfig>();
  const url = `/ws/rest/v1/cashier/paymentMode`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<PaymentMethod> } }>(
    url,
    openmrsFetch,
    swrOption,
  );
  const allowedPaymentModes =
    excludedPaymentMode?.length > 0
      ? data?.data?.results.filter((mode) => !excludedPaymentMode.some((excluded) => excluded.uuid === mode.uuid)) ?? []
      : data?.data?.results ?? [];
  return {
    paymentModes: allowedPaymentModes,
    isLoading,
    mutate,
    error,
  };
};

export const checkPaymentStatus = (transactionId: string) => {
  const url = `${restBaseUrl}/rmsdataexchange/api/rmsmpesachecker?transactionId=${transactionId}`;
  return openmrsFetch<PaymentStatusResponse>(url);
};
