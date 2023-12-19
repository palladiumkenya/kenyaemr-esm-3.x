import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

type ResponseObject = {
  results: Array<OpenmrsResource>;
};

export const useBillableServices = () => {
  const url = `/ws/rest/v1/cashier/billableService?v=custom:(uuid,name,shortName,serviceStatus,serviceType:(display))`;
  const { data, isLoading, isValidating, error, mutate } = useSWR<{ data: ResponseObject }>(url, openmrsFetch, {});
  return { billableServices: data?.data.results ?? [], isLoading, isValidating, error, mutate };
};
