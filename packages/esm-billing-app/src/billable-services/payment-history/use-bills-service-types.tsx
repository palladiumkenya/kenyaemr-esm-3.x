import { MappedBill } from '../../types';
import { useServiceTypes } from '../billable-service.resource';
import { UseChargeSummaries } from '../billables/charge-summary.resource';

export const useBillsServiceTypes = (bills: MappedBill[]) => {
  const { serviceTypes, isLoading } = useServiceTypes();
  const { isLoading: isLoadingChargeSummaries, chargeSummaryItems } = UseChargeSummaries();

  const allLineItemBillableServicesUUIDs = bills
    .map((bill) => [...bill.lineItems.map((item) => item.billableService.split(':').at(0))])
    .flat();

  const uniqueLineItemUUIDs = Array.from(new Set(allLineItemBillableServicesUUIDs)).map(
    (billableServiceUUID) => chargeSummaryItems.find((item) => item.uuid === billableServiceUUID)?.serviceType?.uuid,
  );

  return {
    isLoading: isLoading || isLoadingChargeSummaries,
    billsServiceTypes: serviceTypes.filter((sType) => uniqueLineItemUUIDs.includes(sType.uuid)),
  };
};
