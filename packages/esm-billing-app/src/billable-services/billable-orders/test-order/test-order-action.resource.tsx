import { openmrsFetch, restBaseUrl, useConfig, useVisit } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { QueueEntry } from '../../../types';
import { BillingConfig } from '../../../config-schema';
import { useMemo } from 'react';
import { checkPaymentMethodExclusion, usePatientBills } from '../../../prompt-payment/prompt-payment.resource';

export const useTestOrderBillStatus = (orderUuid: string, patientUuid: string) => {
  const config = useConfig<BillingConfig>();
  const { currentVisit } = useVisit(patientUuid);
  const { isEmergencyPatient, isLoading: isLoadingQueue } = usePatientQueue(patientUuid);
  const { isLoading, hasPendingPayment } = useOrderPendingPaymentStatus(patientUuid, orderUuid);

  // We want to check if the payment method is in the excluded list this includes insurances, where patient do not need to pay immediately
  const isExcludedPaymentMethod = checkPaymentMethodExclusion(
    currentVisit,
    config?.paymentMethodsUuidsThatShouldNotShowPrompt,
  );

  return useMemo(() => {
    if (isLoading || isLoadingQueue) {
      return { hasPendingPayment: false, isLoading: true };
    }

    if (currentVisit?.visitType?.uuid === config?.inPatientVisitTypeUuid || isEmergencyPatient) {
      return { hasPendingPayment: false, isLoading: false };
    }

    if (isExcludedPaymentMethod) {
      return { hasPendingPayment: false, isLoading: false };
    }

    return { hasPendingPayment, isLoading: false };
  }, [
    isLoadingQueue,
    isLoading,
    currentVisit?.visitType?.uuid,
    config?.inPatientVisitTypeUuid,
    isExcludedPaymentMethod,
    isEmergencyPatient,
    hasPendingPayment,
  ]);
};

export const usePatientQueue = (patientUuid: string) => {
  const config = useConfig<BillingConfig>();
  const url = `${restBaseUrl}/visit-queue-entry?patient=${patientUuid}`;
  const { data, isLoading, error } = useSWR<{
    data: { results: Array<QueueEntry> };
  }>(url, openmrsFetch);

  return useMemo(() => {
    const isEmergencyPatient =
      data?.data?.results?.[0]?.queueEntry?.priority?.uuid === config?.concepts?.emergencyPriorityConceptUuid;
    const isInQueue = data?.data?.results?.length > 0;
    return { isInQueue, isLoading, error, isEmergencyPatient };
  }, [data, isLoading, error, config?.concepts?.emergencyPriorityConceptUuid]);
};

export const useOrderPendingPaymentStatus = (patientUuid: string, orderUuid: string) => {
  const { patientBills, isLoading, error } = usePatientBills(patientUuid);
  const flattenedLineItems = useMemo(() => {
    return patientBills
      ?.map((bill) => bill.lineItems)
      .flat()
      .filter((lineItem) => lineItem.order && lineItem.order.uuid === orderUuid);
  }, [patientBills, orderUuid]);

  const hasPendingPayment = useMemo(() => {
    return flattenedLineItems?.some(
      (lineItem) => lineItem.paymentStatus === 'PENDING' || lineItem.paymentStatus === 'POSTED',
    );
  }, [flattenedLineItems]);

  return useMemo(() => ({ hasPendingPayment, isLoading, error }), [hasPendingPayment, isLoading, error]);
};

export const useOrderBill = (patientUuid: string, orderUuid: string) => {
  const { patientBills, isLoading, error } = usePatientBills(patientUuid);
  const itemHasBill = useMemo(() => {
    return patientBills
      ?.map((bill) => bill.lineItems)
      .flat()
      .filter((lineItem) => lineItem.order && lineItem.order.uuid === orderUuid);
  }, [patientBills, orderUuid]);
  return { itemHasBill };
};
