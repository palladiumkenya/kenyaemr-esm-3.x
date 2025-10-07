import { openmrsFetch, restBaseUrl, useConfig, Visit } from '@openmrs/esm-framework';
import { FulfillerStatus, Order } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useMemo } from 'react';
import { QueueEntry } from '../../types';
import { ExpressWorkflowConfig } from '../../config-schema';

export interface UseLabOrdersParams {
  status?: FulfillerStatus;
  newOrdersOnly?: boolean;
  excludeCanceled?: boolean;
}

const getTodayRange = () => ({
  start: dayjs().startOf('day').toISOString(),
  end: dayjs().endOf('day').toISOString(),
});

export const useTotalVisits = () => {
  const url = `${restBaseUrl}/visit?includeInactive=true&v=custom:(uuid,startDatetime,stopDatetime)&fromStartDate=${dayjs().format(
    'YYYY-MM-DD',
  )}`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<Visit> } }>(url, openmrsFetch);

  return {
    data: data?.data?.results,
    error,
    isLoading,
  };
};

export function useLabOrders(params: UseLabOrdersParams = {}) {
  const { status, newOrdersOnly = false, excludeCanceled = true } = params;
  const { labOrderTypeUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange();
    let apiUrl = `${restBaseUrl}/order?orderTypes=${labOrderTypeUuid}&v=custom:(uuid,dateActivated,action,fulfillerStatus,dateStopped)`;

    if (status) {
      apiUrl += `&fulfillerStatus=${status}`;
    }
    if (excludeCanceled) {
      apiUrl += `&excludeCanceledAndExpired=true&excludeDiscontinueOrders=true`;
    }
    apiUrl += `&activatedOnOrAfterDate=${start}&activatedOnOrBeforeDate=${end}`;

    return apiUrl;
  }, [status, excludeCanceled]);

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Order> } }>(url, openmrsFetch);

  const filteredOrders = useMemo(() => {
    const orders = data?.data?.results ?? [];
    return newOrdersOnly ? orders.filter((order) => order.action === 'NEW' && order.fulfillerStatus === null) : orders;
  }, [data, newOrdersOnly]);

  return {
    labOrders: filteredOrders,
    isLoading,
    isError: error,
  };
}

function useRadiologyOrders(fulfillerStatus?: string) {
  const { imagingOrderTypeUuid, imagingConceptClassUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange();
    let apiUrl = `${restBaseUrl}/order?orderTypes=${imagingOrderTypeUuid}&v=custom:(uuid,concept:(conceptClass),action,fulfillerStatus,dateStopped)`;

    if (fulfillerStatus) {
      apiUrl += `&fulfillerStatus=${fulfillerStatus}`;
    }
    apiUrl += `&activatedOnOrAfterDate=${start}&activatedOnOrBeforeDate=${end}`;

    return apiUrl;
  }, [fulfillerStatus, imagingOrderTypeUuid]);

  const { data, isLoading } = useSWR<{ data: { results: Array<any> } }>(url, openmrsFetch);

  const count = useMemo(() => {
    const orders = data?.data?.results ?? [];
    return orders.filter(
      (order) =>
        !order.dateStopped &&
        order.concept.conceptClass.uuid === imagingConceptClassUuid &&
        order.action !== 'DISCONTINUE' &&
        (fulfillerStatus
          ? order.fulfillerStatus === fulfillerStatus
          : !order.fulfillerStatus && order.action === 'NEW'),
    ).length;
  }, [data, fulfillerStatus, imagingConceptClassUuid]);

  return { count, isLoading };
}

export const useInvestigationStats = () => {
  const { labOrders: newLabOrders, isLoading: loadingNewLab } = useLabOrders({ newOrdersOnly: true });
  const { labOrders: completedLabOrders, isLoading: loadingCompletedLab } = useLabOrders({
    status: 'COMPLETED',
    excludeCanceled: false,
  });
  const { count: newRadiologyCount, isLoading: loadingNewRadiology } = useRadiologyOrders();
  const { count: completedRadiologyCount, isLoading: loadingCompletedRadiology } = useRadiologyOrders('COMPLETED');

  const awaitingCount = newLabOrders.length + newRadiologyCount;
  const completedCount = completedLabOrders.length + completedRadiologyCount;

  return {
    awaitingCount,
    completedCount,
    totalCount: awaitingCount + completedCount,
    isLoading: loadingNewLab || loadingCompletedLab || loadingNewRadiology || loadingCompletedRadiology,
  };
};

export const useQueuePriorityCounts = (queueEntries: Array<QueueEntry>) => {
  return useMemo(() => {
    const counts = {
      emergency: 0,
      urgent: 0,
      notUrgent: 0,
    };

    queueEntries.forEach((entry) => {
      const priority = entry.priority.display.toLowerCase();

      if (priority === 'emergency') {
        counts.emergency++;
      } else if (priority === 'urgent') {
        counts.urgent++;
      } else if (priority === 'not urgent') {
        counts.notUrgent++;
      }
    });

    return counts;
  }, [queueEntries]);
};
