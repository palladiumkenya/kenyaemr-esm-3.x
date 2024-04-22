/* eslint-disable no-console */
import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';
import { Buffer } from 'buffer';

type PaymentMethod = {
  uuid: string;
  description: string;
  name: string;
  retired: boolean;
};

const swrOption = {
  errorRetryCount: 2,
};

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

export const generateStkAccessToken = async () => {
  try {
    const consumer_key = 'WK6ABTLXbJtcySnmvHBV7WTH285O0k9NoTs5fzWXGt6PGiUM';
    const consumer_secret = 'C82O7IoDR8onqibYGRQpV2xIaGRWY7Ozr7NbnOAbTuj8SCaJGMbTNhh0qBrBQ1VO';
    const authorization_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    };
    const response = await openmrsFetch(authorization_url, { method: 'GET', headers });
    const { access_token } = await response.json();
    console.log('[its-kios09]: STK PUSH access token generate ', access_token);
    return access_token;
  } catch (error) {
    console.error(error);
  }
};

export const initiateStkPush = async (payload) => {
  try {
    const access_token = await generateStkAccessToken();
    console.log('[itskios-09]: Generated Access Token from initiateStkPush:', access_token);
    const initiateUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    return openmrsFetch(initiateUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
  } catch (error) {
    console.error(error);
  }
};
