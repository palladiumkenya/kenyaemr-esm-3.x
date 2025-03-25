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

  const { isLoading, hasPendingPayment } = useBillStatus(orderUuid, patientUuid);

  const isInProgress = order?.fulfillerStatus === FulfillerStatus.IN_PROGRESS;
  const buttonText = hasPendingPayment ? t('unsettledBill', 'Unsettled bill') : t('pickLabRequest', 'Pick Lab Request');

  return {
    isLoading,
    isDisabled: hasPendingPayment,
    buttonText,
    isInProgress,
    orderUuid,
    patientUuid,
  };
}
