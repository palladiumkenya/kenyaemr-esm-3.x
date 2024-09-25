import { MappedBill } from '../../types';
import { useServiceTypes } from '../billable-service.resource';

export const useBillsServiceTypes = (bills: MappedBill[]) => {
  const { serviceTypes, isLoading } = useServiceTypes();

  if (isLoading) {
    return [];
  }

  const allLineItemServiceUUIDs = bills
    .map((bill) => [...bill.lineItems.map((item) => item.itemOrServiceConceptUuid)])
    .flat();

  const uniqueLineItemUUIDs = Array.from(new Set(allLineItemServiceUUIDs));

  return serviceTypes.filter((sType) => uniqueLineItemUUIDs.includes(sType.uuid));
};
