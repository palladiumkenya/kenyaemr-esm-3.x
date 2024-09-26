import { MappedBill } from '../../types';
import { useServiceTypes } from '../billable-service.resource';
import { UseChargeSummaries } from '../billables/charge-summary.resource';

export const useBillsServiceTypes = (bills: MappedBill[]) => {
  const { serviceTypes, isLoading } = useServiceTypes();
  const { isLoading: isLoadingChargeSummaries, chargeSummaryItems } = UseChargeSummaries();

  const allLineItemBillableServicesUUIDs = bills
    .map((bill) => [...bill.lineItems.map((item) => item.billableService.split(':').at(0))])
    .flat();

  //finding the billable service`s service type
  const lineItemServiceTypeUUIDS = allLineItemBillableServicesUUIDs.map(
    (billableServiceUUID) => chargeSummaryItems.find((item) => item.uuid === billableServiceUUID)?.serviceType?.uuid,
  );

  const uniqueLineItemServiceType = Array.from(new Set(lineItemServiceTypeUUIDS));

  return {
    isLoading: isLoading || isLoadingChargeSummaries,
    billsServiceTypes: serviceTypes.filter((sType) => uniqueLineItemServiceType.includes(sType.uuid)),
  };
};
