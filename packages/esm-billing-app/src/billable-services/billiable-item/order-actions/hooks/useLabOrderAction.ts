import { useTranslation } from 'react-i18next';
import { Order } from '@openmrs/esm-patient-common-lib';
import { useBillStatus } from './useBillStatus';
import { useBillableServices } from '../../../billable-service.resource';

export enum FulfillerStatus {
  IN_PROGRESS = 'IN_PROGRESS',
}

export function useLabOrderAction(order?: Order) {
  const { t } = useTranslation();
  const orderUuid = order?.uuid;
  const patientUuid = order?.patient?.uuid;
  const conceptClass = order?.concept?.conceptClass?.['display'];
  const { isLoading: isLoadingBillableServices, billableServices } = useBillableServices();

  const serviceBillingStatus =
    billableServices?.find((service) => service.concept.uuid === order.concept.uuid)?.serviceStatus === 'ENABLED';

  const { isLoading, hasPendingPayment, itemHasBill } = useBillStatus(orderUuid, patientUuid);
  const shouldShowBillModal = itemHasBill.length < 1 && serviceBillingStatus;
  const isInProgress = order?.fulfillerStatus === FulfillerStatus.IN_PROGRESS;

  const getOrderType = () => {
    if (!conceptClass) {
      return 'Lab Request';
    }
    if (conceptClass.includes('/')) {
      return conceptClass.split('/')[1].trim();
    }
    return conceptClass;
  };

  const getButtonText = () => {
    if (hasPendingPayment) {
      return t('unsettledBill', 'Unsettled bill');
    }

    if (shouldShowBillModal) {
      return t('bill', 'Bill');
    }

    return t('pickLabRequest', 'Pick {{orderType}}', { orderType: getOrderType() ?? 'Lab Request' });
  };

  return {
    isLoading: isLoading && isLoadingBillableServices,
    isDisabled: hasPendingPayment,
    buttonText: getButtonText(),
    isInProgress,
    orderUuid,
    patientUuid,
    shouldShowBillModal,
  };
}
