import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

type ResponseObject = {
  results: Array<OpenmrsResource>;
};

export const useBillableServices = () => {
  const url = `/ws/rest/v1/cashier/billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(display),servicePrices:(uuid,name,price))`;
  const { data, isLoading, isValidating, error, mutate } = useSWR<{ data: ResponseObject }>(url, openmrsFetch, {});
  return { billableServices: data?.data.results ?? [], isLoading, isValidating, error, mutate };
};

export function useServiceTypes() {
  const url = `/ws/rest/v1/concept/d7bd4cc0-90b1-4f22-90f2-ab7fde936727?v=custom:(setMembers:(uuid,display))`;
  const { data, error } = useSWR<{ data: any }>(url, openmrsFetch, {});
  return { serviceTypes: data?.data.setMembers ?? [], error };
}

export const usePaymentModes = () => {
  const url = `/ws/rest/v1/cashier/paymentMode`;
  const { data, error } = useSWR<{ data: ResponseObject }>(url, openmrsFetch, {});
  return { paymentModes: data?.data.results ?? [], error };
};

export const createBillableSerice = (payload: any) => {
  const url = `/ws/rest/v1/cashier/api/billable-service`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
