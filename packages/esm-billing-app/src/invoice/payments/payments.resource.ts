import useSWR from 'swr';
import { FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';
import { LineItemStockQuery, type StockItemResponse } from '../../types';
import React from 'react';

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
  InvoiceNumber?: string;
  OrgAccountBalance: string;
  ThirdPartyTransID?: string;
  MSISDN: string;
  FirstName: string;
  MiddleName?: string;
  LastName?: string;
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

export const useStockItems = (queries: LineItemStockQuery[]) => {
  const urls = queries.map(
    (query) =>
      `${restBaseUrl}/stockmanagement/stockitem?limit=10&q=${encodeURIComponent(query.drugName)}&totalCount=true`,
  );

  const { data, error, isLoading } = useSWR<Array<FetchResponse<{ results: StockItemResponse[] }>>>(urls, (urls) =>
    Promise.all(urls.map((url) => openmrsFetch(url))),
  );

  const lineItemToStockMap = React.useMemo(() => {
    const map = new Map<string, string>();
    data?.forEach((response, index) => {
      const query = queries[index];
      const matchingItem = response.data.results.find(
        (item) =>
          item.drugName.toLowerCase().includes(query.drugName.toLowerCase()) && item.conceptUuid === query.conceptUuid,
      );
      if (matchingItem) {
        map.set(query.lineItemUuid, matchingItem.uuid);
      }
    });
    return map;
  }, [data, queries]);

  return {
    isLoading,
    error,
    lineItemToStockMap,
  };
export const checkPaymentStatus = (transactionId: string) => {
  const url = `${restBaseUrl}/rmsdataexchange/api/rmsmpesachecker?transactionId=${transactionId}`;
  return openmrsFetch<PaymentStatusResponse>(url);
};
