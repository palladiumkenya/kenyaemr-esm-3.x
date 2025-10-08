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
  const url = `${restBaseUrl}/visit?includeInactive=false&v=custom:(uuid)&fromStartDate=${dayjs().format(
    'YYYY-MM-DD',
  )}&toStartDate=${dayjs().format('YYYY-MM-DD')}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Visit> } }>(url, openmrsFetch);

  return {
    data: data?.data?.results,
    error,
    isLoading,
  };
};

export function useLabOrders(params: UseLabOrdersParams = {}) {
  const { status, excludeCanceled = true } = params;
  const { labOrderTypeUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange();
    let apiUrl = `${restBaseUrl}/order?orderTypes=${labOrderTypeUuid}&v=custom:(uuid)`;

    if (!status) {
      apiUrl += `&action=NEW`;
    }

    if (status) {
      apiUrl += `&fulfillerStatus=${status}`;
    }

    if (excludeCanceled) {
      apiUrl += `&excludeCanceledAndExpired=true&excludeDiscontinueOrders=true`;
    }

    apiUrl += `&activatedOnOrAfterDate=${start}&activatedOnOrBeforeDate=${end}`;

    return apiUrl;
  }, [status, excludeCanceled, labOrderTypeUuid]);

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Order> } }>(url, openmrsFetch);

  return {
    labOrders: data?.data?.results ?? [],
    isLoading,
    isError: error,
  };
}

function useRadiologyOrders(fulfillerStatus?: string) {
  const { imagingOrderTypeUuid, imagingConceptClassUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange();
    let apiUrl = `${restBaseUrl}/order?orderTypes=${imagingOrderTypeUuid}&v=custom:(uuid,concept:(conceptClass),action,dateStopped)`;

    if (!fulfillerStatus) {
      apiUrl += `&action=NEW`;
    }

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
        order.action !== 'DISCONTINUE',
    ).length;
  }, [data, imagingConceptClassUuid]);

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
  const { priorities } = useConfig<ExpressWorkflowConfig>();

  return useMemo(() => {
    const counts = {
      emergency: 0,
      urgent: 0,
      notUrgent: 0,
    };

    queueEntries.forEach((entry) => {
      const priorityUuid = entry.priority.uuid;

      if (priorityUuid === priorities?.emergencyPriorityConceptUuid) {
        counts.emergency++;
      } else if (priorityUuid === priorities?.urgentPriorityConceptUuid) {
        counts.urgent++;
      } else if (priorityUuid === priorities?.notUrgentPriorityConceptUuid) {
        counts.notUrgent++;
      }
    });

    return counts;
  }, [queueEntries, priorities]);
};
