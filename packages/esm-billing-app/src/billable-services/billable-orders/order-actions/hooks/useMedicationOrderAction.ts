import { useTranslation } from 'react-i18next';
import { useStockItemQuantity } from '../../useBillableItem';
import { useBillableServices } from '../../../../bill-administration/service-catalog/billable-service.resource';

import { useBillStatus } from './useBillStatus';
import { createMedicationDispenseProps } from '../../test-order/dispense.resource';

interface MedicationRequest {
  request: fhir.MedicationRequest;
  dispenses: Array<fhir.MedicationDispense>;
}

export function useMedicationOrderAction(medicationRequestBundle?: MedicationRequest) {
  const { t } = useTranslation();
  const request = medicationRequestBundle?.request;
  const orderUuid = request?.id;
  const patientUuid = request?.subject?.reference?.split('/')[1];
  const drugUuid = request?.medicationReference?.reference?.split('/')[1];

  const { isLoading, hasPendingPayment, itemHasBill } = useBillStatus(orderUuid, patientUuid);
  const { stockItemQuantity, stockItemUuid } = useStockItemQuantity(drugUuid);
  const { billableServices } = useBillableServices();

  const billableItem =
    billableServices?.filter((service) => {
      if (service?.stockItem !== null && service?.stockItem !== undefined) {
        const serviceStockItemUuid = service?.stockItem?.uuid;
        return serviceStockItemUuid === stockItemUuid;
      }
      return false;
    }) || [];
  const billableItemServiceStatus = billableItem.some((item) => item.serviceStatus === 'DISABLED');

  const dispenseFormProps = medicationRequestBundle ? createMedicationDispenseProps({ medicationRequestBundle }) : null;

  const shouldShowBillModal =
    stockItemQuantity > 0 && itemHasBill.length < 1 && billableItem.length > 0 && !billableItemServiceStatus;
  const isDisabled = hasPendingPayment || (stockItemQuantity < 1 && !!drugUuid);
  const isANonBillableItem = billableItem.length === 0;
  const hasBeenDispensed = medicationRequestBundle?.dispenses?.length > 0;

  /**
   * Determines if modification of the medication order is allowed based on several conditions:
   * 1. No pending payments exist
   * 2. Stock item is available (quantity > 0)
   * 3. Item hasn't been billed yet (no existing bills)
   * 4. Item exists in billable items list
   * 5. Special case: Non-billable items that haven't been dispensed can be modified
   */
  const shouldAllowModify = (() => {
    // Special case: Non-billable items that haven't been dispensed can always be modified
    if (!hasBeenDispensed && isANonBillableItem) {
      return true;
    }

    // For all other cases, check the standard conditions
    const hasNoPendingPayments = !hasPendingPayment;
    const hasAvailableStock = stockItemQuantity > 0;
    const hasNoExistingBills = itemHasBill.length < 1;
    const isBillableItem = billableItem.length > 0;

    return hasNoPendingPayments && hasAvailableStock && hasNoExistingBills && isBillableItem;
  })();

  const getButtonText = () => {
    if (hasPendingPayment) {
      return t('unsettledBill', 'Unsettled bill');
    }

    if (stockItemQuantity < 1 && drugUuid) {
      return t('outOfStock', 'Out of Stock');
    }

    if (shouldShowBillModal) {
      return t('bill', 'Bill');
    }

    return t('dispense', 'Dispense');
  };
  return {
    isLoading,
    isDisabled,
    buttonText: getButtonText(),
    shouldShowBillModal,
    dispenseFormProps,
    orderUuid,
    patientUuid,
    billableItem,
    itemHasBill,
    medicationRequestBundle,
    hasPendingPayment,
    shouldAllowModify,
  };
}

import { useMemo } from 'react';
import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { Order } from '@openmrs/esm-patient-common-lib';
import useSWR from 'swr';

const customRepresentation =
  'custom:(uuid,dosingType,orderNumber,accessionNumber,' +
  'patient:ref,action,careSetting:ref,previousOrder:ref,dateActivated,scheduledDate,dateStopped,autoExpireDate,' +
  'orderType:ref,encounter:ref,orderer:(uuid,display,person:(display)),orderReason,orderReasonNonCoded,orderType,urgency,instructions,' +
  'commentToFulfiller,drug:(uuid,display,strength,dosageForm:(display,uuid),concept),dose,doseUnits:ref,' +
  'frequency:ref,asNeeded,asNeededCondition,quantity,quantityUnits:ref,numRefills,dosingInstructions,' +
  'duration,durationUnits:ref,route:ref,brandName,dispenseAsWritten)';

/**
 * Hook to get a single order by UUID.
 *
 * @param orderUuid The UUID of the order to fetch.
 */
export function useOrderByUuid(orderUuid: string) {
  const ordersUrl = useMemo(
    () => (orderUuid ? `${restBaseUrl}/order/${orderUuid}?v=${customRepresentation}` : null),
    [orderUuid],
  );
  const { data, error, isLoading, isValidating, mutate } = useSWR<FetchResponse<Order>, Error>(ordersUrl, openmrsFetch);

  return {
    data: data?.data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
