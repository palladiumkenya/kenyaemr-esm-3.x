import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

type StockItemResponse = {
  results: Array<{
    uuid: string;
    drugUuid: string;
    drugName: string;
    conceptUuid: string;
    conceptName: string;
    hasExpiration: boolean;
    preferredVendorUuid: string;
    preferredVendorName: string;
    purchasePrice: number | null;
    purchasePriceUoMUuid: string | null;
    purchasePriceUoMName: string | null;
    purchasePriceUoMFactor: number | null;
    dispensingUnitName: string;
    dispensingUnitUuid: string;
    dispensingUnitPackagingUoMUuid: string;
    dispensingUnitPackagingUoMName: string;
    dispensingUnitPackagingUoMFactor: number;
    defaultStockOperationsUoMUuid: string | null;
    defaultStockOperationsUoMName: string | null;
    defaultStockOperationsUoMFactor: number | null;
    categoryUuid: string;
    categoryName: string;
    commonName: string;
    acronym: string | null;
    reorderLevel: number | null;
    reorderLevelUoMUuid: string | null;
    reorderLevelUoMName: string | null;
    reorderLevelUoMFactor: number | null;
    dateCreated: string;
    creatorGivenName: string;
    creatorFamilyName: string;
    voided: boolean;
    expiryNotice: number;
    links: {
      rel: string;
      uri: string;
      resourceAlias: string;
    }[];
    resourceVersion: string;
  }>;
};

export const useCommodityItem = (searchTerm: string = '') => {
  const url = `${restBaseUrl}/stockmanagement/stockitem?v=default&limit=10&q=${searchTerm}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: StockItemResponse }>(url, openmrsFetch);

  return {
    stockItems: data?.data?.results ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
};
