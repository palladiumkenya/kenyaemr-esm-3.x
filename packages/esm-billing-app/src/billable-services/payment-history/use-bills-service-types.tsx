import { MappedBill } from '../../types';
import { useServiceTypes } from '../billable-service.resource';

export const useBillsServiceTypes = (bills: MappedBill[]) => {
  const { serviceTypes, isLoading } = useServiceTypes();
  const lineItemServiceTypeUUIDS = bills
    .map((bill) => bill.lineItems.map((lineItem) => lineItem.serviceTypeUuid))
    .flat();
  const uniqueLineItemServiceTypeUUIDs = Array.from(new Set(lineItemServiceTypeUUIDS));

  return {
    isLoading: isLoading,
    billsServiceTypes: serviceTypes.filter((sType) => uniqueLineItemServiceTypeUUIDs.includes(sType.uuid)),
  };
};
