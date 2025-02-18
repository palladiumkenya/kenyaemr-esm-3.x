import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

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
  const { data, error, isLoading } = useSWR<{
    data: { results: Array<{ quantityUoM: string; quantity: number; partyName: string }> };
  }>(url, openmrsFetch);
  return {
    stockItem: (data?.data?.results as Array<any>) ?? [],
    isLoading: isLoading,
    error,
  };
};

export const useStockItemQuantity = (drugUuid: string) => {
  const url = `/ws/rest/v1/stockmanagement/stockiteminventory?v=default&limit=10&totalCount=true&drugUuid=${drugUuid}`;
  const { data, error, isLoading } = useSWR<{
    data: {
      results: Array<{ quantityUoM: string; quantity: number; partyName: string; stockItemUuid: string }>;
      total: number;
    };
  }>(url, openmrsFetch);
  return {
    stockItemQuantity: data?.data?.total ?? 0,
    stockItemUuid: data?.data?.results[0]?.stockItemUuid ?? '',
    isLoading: isLoading,
    error,
  };
};
