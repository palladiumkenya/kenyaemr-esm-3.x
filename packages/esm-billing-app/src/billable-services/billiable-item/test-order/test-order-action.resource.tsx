import { openmrsFetch, restBaseUrl, useConfig, useVisit } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { QueueEntry } from '../../../types';
import { BillingConfig } from '../../../config-schema';
import { usePatientBills } from '../../../modal/require-payment.resource';
import { useMemo } from 'react';

export const useTestOrderBillStatus = (orderUuid: string, patientUuid: string) => {
  const config = useConfig<BillingConfig>();
  const { currentVisit } = useVisit(patientUuid);
  const { isEmergencyPatient, isLoading: isLoadingQueue } = usePatientQueue(patientUuid);
  const { isLoading: isLoadingBill, hasPendingPayment } = useOrderPendingPaymentStatus(patientUuid, orderUuid);

  return useMemo(() => {
    if (isLoadingQueue || isLoadingBill) {
      return { hasPendingPayment: false, isLoading: true };
    }

    if (currentVisit?.visitType?.uuid === config?.inPatientVisitTypeUuid || isEmergencyPatient) {
      return { hasPendingPayment: false, isLoading: false };
    }

    return { hasPendingPayment, isLoading: false };
  }, [
    isLoadingQueue,
    isLoadingBill,
    currentVisit?.visitType?.uuid,
    config?.inPatientVisitTypeUuid,
    isEmergencyPatient,
    hasPendingPayment,
  ]);
};

export const usePatientQueue = (patientUuid: string) => {
  const config = useConfig({ externalModuleName: '@kenyaemr/esm-service-queues-app' });
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
