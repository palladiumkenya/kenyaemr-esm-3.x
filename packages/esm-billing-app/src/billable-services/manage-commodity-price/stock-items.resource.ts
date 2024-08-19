import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { ResourceFilterCriteria, toQueryParams } from './../api';
import { PageableResult } from './../PageableResult';
import useSWR from 'swr';

export interface StockItemFilter extends ResourceFilterCriteria {
  isDrug?: string | null | undefined;
  drugUuid?: string | null;
  conceptUuid?: string | null;
}
export interface StockItemDTO {
  uuid: string | null | undefined;
  isDrug: boolean | null | undefined;
  drugUuid: string | null | undefined;
  drugName: string | null | undefined;
  conceptUuid: string | null | undefined;
  commonName: string | null | undefined;
  acronym: string | null | undefined;
  conceptName: string | null | undefined;
  hasExpiration: boolean | null | undefined;
  preferredVendorUuid: string | null | undefined;
  preferredVendorName: string | null | undefined;
  purchasePrice: number | null | undefined;
  purchasePriceUoMUuid: string | null | undefined;
  purchasePriceUoMName: string | null | undefined;
  dispensingUnitName: string | null | undefined;
  dispensingUnitUuid: string | null | undefined;
  dispensingUnitPackagingUoMUuid: string | null | undefined;
  dispensingUnitPackagingUoMName: string | null | undefined;
  defaultStockOperationsUoMUuid: string | null | undefined;
  defaultStockOperationsUoMName: string | null | undefined;
  reorderLevel: number | null | undefined;
  reorderLevelUoMUuid: string | null | undefined;
  reorderLevelUoMName: string | null | undefined;
  dateCreated: Date | null | undefined;
  creatorGivenName: string | null | undefined;
  creatorFamilyName: string | null | undefined;
  voided: boolean | null | undefined;
  packagingUnits: any[];
  permission: any;
  categoryUuid: string | null | undefined;
  categoryName: string | null | undefined;
  expiryNotice: number | null | undefined;
}
export interface StockItemTransactionFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null;
  partyUuid?: string | null;
  stockOperationUuid?: string | null;
  includeBatchNo?: boolean | null;
  dateMin?: string | null;
  dateMax?: string | null;
  stockBatchUuid?: string | null | undefined;
}

export interface StockItemPackagingUOMFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null | undefined;
}

export interface StockItemReferenceFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null | undefined;
}

export interface StockBatchFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null | undefined;
  excludeExpired?: boolean | null;
  includeStockItemName?: 'true' | 'false' | '0' | '1';
}

export interface StockRuleFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null;
  locationUuid?: string | null;
}

// getStockItems
export function useStockItems(filter: StockItemFilter) {
  const apiUrl = `${restBaseUrl}/stockmanagement/stockitem${toQueryParams(filter)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<StockItemDTO>;
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data?.data || <PageableResult<StockItemDTO>>{},
    isLoading,
    isError: error,
  };
}

// update  stock item purchase price
export function updateStockItemPurchasePrice(payload: any) {
  const apiUrl = `${restBaseUrl}/stockmanagement/stockitem/${payload.uuid}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: payload,
  });
}
