import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

type ResponseObject = {
  results: Array<OpenmrsResource>;
};

export const useBillableServices = () => {
  const url = ``;
  const { data, isLoading, error, mutate } = useSWR<{ data: ResponseObject }>(url, openmrsFetch, {});
  return { billableServices: data?.data.results ?? [], isLoading, error, mutate };
};
