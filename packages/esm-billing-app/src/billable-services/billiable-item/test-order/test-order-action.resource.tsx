import { openmrsFetch, restBaseUrl, useConfig, useVisit } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { LineItem, QueueEntry } from '../../../types';
import { BillingConfig } from '../../../config-schema';

export const useTestOrderBillStatus = (orderUuid: string, patientUuid: string) => {
  const config = useConfig<BillingConfig>();
  const { currentVisit } = useVisit(patientUuid);
  const { isEmergencyPatient, isLoading: isLoadingQueue } = usePatientQueue(patientUuid);
  const { isLoading: isLoadingBill, hasPendingPayment } = usePatientBill(orderUuid);

  if (isLoadingQueue || isLoadingBill) {
    return { hasPendingPayment: false, isLoading: true };
  }

  // If current visit type is inpatient or the patient is in the emergency queue, we should allow the patient to receive services without paying the bill
  if (currentVisit?.visitType?.uuid === config?.inPatientVisitTypeUuid || isEmergencyPatient) {
    return { hasPendingPayment: false, isLoading: false };
  }

  // If the patient is not in the queue then we should check if the patient has a pending bill
  return { hasPendingPayment, isLoading: false };
};

export const usePatientQueue = (patientUuid: string) => {
  const config = useConfig({ externalModuleName: '@kenyaemr/esm-service-queues-app' });
  const url = `${restBaseUrl}/visit-queue-entry?patient=${patientUuid}`;
  const { data, isLoading, error } = useSWR<{
    data: { results: Array<QueueEntry> };
  }>(url, openmrsFetch);

  const isEmergencyPatient =
    data?.data?.results?.[0]?.queueEntry?.priority?.uuid === config?.concepts?.emergencyPriorityConceptUuid;
  const isInQueue = data?.data?.results?.length > 0;
  return { isInQueue, isLoading, error, isEmergencyPatient };
};

export const usePatientBill = (orderUuid: string) => {
  const { billingStatusQueryUrl } = useConfig<BillingConfig>();
  const billUrl = createUrl(restBaseUrl, orderUuid, billingStatusQueryUrl);
  const { data, isLoading, error } = useSWR<{
    data: { results: Array<LineItem> };
  }>(billUrl, openmrsFetch);

  const hasPendingPayment = data?.data?.results?.some(
    (lineItem) => lineItem.paymentStatus === 'PENDING' || lineItem.paymentStatus === 'POSTED',
  );

  return { hasPendingPayment, isLoading, error };
};

function createUrl(restBaseUrl: string, orderUuid: string, templateUrl: string): string {
  return templateUrl.replace('${restBaseUrl}', restBaseUrl).replace('${orderUuid}', orderUuid);
}
