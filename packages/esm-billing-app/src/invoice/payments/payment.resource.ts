/* eslint-disable no-console */
import useSWR from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { BillingConfig } from '../../config-schema';
import { Buffer } from 'buffer';
import axios from 'axios';

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
    const consumerKey = '';
    const consumerSecret = '';
    const authorizationUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    };
    const response = await axios(authorizationUrl, { method: 'GET', headers });
    const { access_token } = await response.data;
    console.log(access_token);
    return access_token;
  } catch (error) {
    console.error(error);
  }
};
export const initiateStkPush = async (payload) => {
  try {
    const access_token = await generateStkAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    };
    const initiateUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    return await axios.post(initiateUrl, payload, { headers: headers });
  } catch (error) {
    console.error(error);
  }
};
