import useSWR from 'swr';
import { Visit, openmrsFetch } from '@openmrs/esm-framework';

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
  const url = `/ws/rest/v1/cashier/paymentMode`;
  const { data, isLoading, error, mutate } = useSWR<{ data: { results: Array<PaymentMethod> } }>(
    url,
    openmrsFetch,
    swrOption,
  );

  return {
    paymentModes: data?.data?.results ?? [],
    isLoading,
    mutate,
    error,
  };
};

export const updateBillVisitAttribute = async (visit: Visit) => {
  const { uuid, attributes } = visit;
  const pendingPaymentAtrributeUuid = attributes?.find(
    (attribute) => attribute.attributeType.uuid === '919b51c9-8e2e-468f-8354-181bf3e55786',
  )?.uuid;
  return openmrsFetch(`/ws/rest/v1/visit/${uuid}/attribute/${pendingPaymentAtrributeUuid}`, {
    body: { value: false },
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
};
