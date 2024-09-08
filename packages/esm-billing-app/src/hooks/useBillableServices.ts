import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingService } from '../types';

const useBillableServices = () => {
  const customPresentation = `custom:(uuid,name,shortName,serviceStatus,serviceType:(display),servicePrices:(uuid,name,price,paymentMode))`;
  const url = `/ws/rest/v1/cashier/billableService?v=${customPresentation}`;

  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Array<BillingService> }>>(url, openmrsFetch);

  return {
    error,
    isLoading,
    billableServices: data?.data?.results ?? [],
  };
};

export default useBillableServices;
