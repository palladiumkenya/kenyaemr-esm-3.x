import useSWR, { mutate } from 'swr';
import { PaymentMode } from '../types';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

// TODO: Consolidate this hook here from
// 1. billing.resource.ts
// 2. billable-service.resource.ts
// 3. payment-mode.resource.ts

/**
 * A custom hook to fetch payment modes.
 *
 * @returns {Object} An object containing:
 *   - paymentModes: An array of PaymentMode objects
 *   - isLoading: A boolean indicating if the data is still being fetched
 *   - error: Any error that occurred during the fetch operation
 */
export const usePaymentModes = () => {
  const url = `${restBaseUrl}/cashier/paymentMode?v=full`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<PaymentMode> } }>(url, openmrsFetch);

  return {
    paymentModes: data?.data?.results ?? [],
    isLoading,
    error,
  };
};

export const createPaymentMode = (paymentMode: Partial<PaymentMode>, uuid?: string) => {
  const url = uuid ? `${restBaseUrl}/cashier/paymentMode/${uuid}` : `${restBaseUrl}/cashier/paymentMode`;

  return openmrsFetch(url, {
    method: 'POST',
    body: paymentMode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deletePaymentMode = (uuid: string) => {
  return openmrsFetch(`${restBaseUrl}/cashier/paymentMode/${uuid}`, {
    method: 'DELETE',
  });
};

export const handleMutation = (url: string) => {
  mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
};
