import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { Buffer } from 'buffer';
import { BillingConfig } from '../config-schema';

type PaymentMethod = {
  uuid: string;
  description: string;
  name: string;
  retired: boolean;
};

const swrOption = {
  errorRetryCount: 2,
};

export const usePaymentModes = (excludeWaiver: boolean = true) => {
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
    paymentModes: excludeWaiver ? allowedPaymentModes : data?.data?.results,
    isLoading,
    mutate,
    error,
  };
};

export const generateStkAccessToken = async (authorizationUrl: string) => {
  try {
    const consumerKey = '';
    const consumerSecret = '';
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    };
    const response = await fetch(authorizationUrl, { method: 'GET', headers: headers });
    const { access_token } = await response.json();
    return access_token;
  } catch (error) {
    throw error;
  }
};

export const initiateStkPush = async (payload, initiateUrl: string, authorizationUrl: string) => {
  try {
    const access_token = await generateStkAccessToken(authorizationUrl);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    };
    const response = await fetch(initiateUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (err) {
    throw err;
  }
};
