import { useTranslation } from 'react-i18next';
import { Order } from '@openmrs/esm-patient-common-lib';
import { useBillStatus } from './useBillStatus';

export enum FulfillerStatus {
  IN_PROGRESS = 'IN_PROGRESS',
}

export function useLabOrderAction(order?: Order) {
  const { t } = useTranslation();
  const orderUuid = order?.uuid;
  const patientUuid = order?.patient?.uuid;

  const { isLoading, hasPendingPayment, itemHasBill } = useBillStatus(orderUuid, patientUuid);
  const shouldShowBillModal = itemHasBill.length < 1;
  const isInProgress = order?.fulfillerStatus === FulfillerStatus.IN_PROGRESS;

  const getButtonText = () => {
    if (hasPendingPayment) {
      return t('unsettledBill', 'Unsettled bill');
    }

    if (shouldShowBillModal) {
      return t('bill', 'Bill');
    }

    return t('pickLabRequest', 'Pick Lab Request');
  };

  return {
    isLoading,
    isDisabled: hasPendingPayment,
    buttonText: getButtonText(),
    isInProgress,
    orderUuid,
    patientUuid,
    shouldShowBillModal,
  };
}
