import { useOrderBill, useTestOrderBillStatus } from '../../test-order/test-order-action.resource';

export function useBillStatus(orderUuid?: string, patientUuid?: string) {
  const { isLoading, hasPendingPayment } = useTestOrderBillStatus(orderUuid, patientUuid);
  const { itemHasBill } = useOrderBill(patientUuid, orderUuid);

  return {
    isLoading,
    hasPendingPayment,
    itemHasBill,
  };
}
