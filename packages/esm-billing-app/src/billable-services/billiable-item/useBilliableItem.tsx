import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import first from 'lodash-es/first';

type BillableItemResponse = {
  uuid: string;
  name: string;
  concept: {
    uuid: string;
    display: string;
  };
  servicePrices: Array<{
    uuid: string;
    price: number;
    paymentMode: {
      uuid: string;
      name: string;
    };
  }>;
};

export const useBillableItem = (billableItemId: string) => {
  const customRepresentation = `v=custom:(uuid,name,concept:(uuid,display),servicePrices:(uuid,price,paymentMode:(uuid,name)))`;
  const { data, error, isLoading } = useSWRImmutable<{ data: { results: Array<BillableItemResponse> } }>(
    `${restBaseUrl}/cashier/billableService?${customRepresentation}`,
    openmrsFetch,
  );
  const billableItem = data?.data?.results?.find((item) => item?.concept?.uuid === billableItemId);

  return {
    billableItem: billableItem,
    isLoading: isLoading,
    error,
  };
};

export const useSockItemInventory = (stockItemId: string) => {
  const url = `/ws/rest/v1/stockmanagement/stockiteminventory?v=default&limit=10&totalCount=true&drugUuid=${stockItemId}`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<{ quantityUoM: string; quantity: number }> } }>(
    url,
    openmrsFetch,
  );
  const stockItemsInfo = first(data?.data?.results ?? []);
  return {
    stockItem: stockItemsInfo,
    isLoading: isLoading,
    error,
  };
};
