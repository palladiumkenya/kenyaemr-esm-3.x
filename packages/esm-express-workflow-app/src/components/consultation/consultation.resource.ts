import { openmrsFetch, restBaseUrl, useConfig, Visit } from '@openmrs/esm-framework';
import { FulfillerStatus, Order } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useMemo, useCallback } from 'react';
import { Queue, QueueEntry } from '../../types';
import { ExpressWorkflowConfig } from '../../config-schema';
import { useQueueEntries } from '../../hooks/useServiceQueues';

export interface UseLabOrdersParams {
  status?: FulfillerStatus;
  newOrdersOnly?: boolean;
  excludeCanceled?: boolean;
}

const getTodayRange = () => ({
  start: dayjs().startOf('day').toISOString(),
  end: dayjs().endOf('day').toISOString(),
});

// Helper function to filter orders by visit type (OPD only)
const filterOrdersByVisitType = (orders: Array<any>, outpatientVisitTypeUuid?: string) => {
  if (!outpatientVisitTypeUuid) {
    return orders;
  }

  return orders.filter((order) => {
    const visitTypeUuid = order?.encounter?.visit?.visitType?.uuid;
    return visitTypeUuid === outpatientVisitTypeUuid;
  });
};

export const useTotalVisits = () => {
  const customRepresentation = 'custom:(uuid,startDatetime,stopDatetime,visitType:(uuid,display))';

  const visitsUrl = `${restBaseUrl}/visit?includeInactive=true&v=${customRepresentation}&fromStartDate=${dayjs().format(
    'YYYY-MM-DD',
  )}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: { results: Array<Visit> } }>(visitsUrl, openmrsFetch, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  return {
    data: data?.data?.results,
    error,
    isLoading,
    mutate,
  };
};

export function useLabOrders(params: UseLabOrdersParams = {}) {
  const { status, excludeCanceled = true } = params;
  const { labOrderTypeUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange();
    let apiUrl = `${restBaseUrl}/order?orderTypes=${labOrderTypeUuid}&v=custom:(uuid,encounter:(visit:(uuid,visitType:(uuid))))`;

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

  const { data, error, isLoading, mutate } = useSWR<{ data: { results: Array<Order> } }>(url, openmrsFetch, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  return {
    labOrders: data?.data?.results ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

function useRadiologyOrders(fulfillerStatus?: string) {
  const { imagingOrderTypeUuid, imagingConceptClassUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange();
    let apiUrl = `${restBaseUrl}/order?orderTypes=${imagingOrderTypeUuid}&v=custom:(uuid,concept:(conceptClass),action,dateStopped,encounter:(visit:(uuid,visitType:(uuid))))`;

    if (!fulfillerStatus) {
      apiUrl += `&action=NEW`;
    }

    if (fulfillerStatus) {
      apiUrl += `&fulfillerStatus=${fulfillerStatus}`;
    }

    apiUrl += `&activatedOnOrAfterDate=${start}&activatedOnOrBeforeDate=${end}`;

    return apiUrl;
  }, [fulfillerStatus, imagingOrderTypeUuid]);

  const { data, isLoading, mutate } = useSWR<{ data: { results: Array<any> } }>(url, openmrsFetch, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const { imagingConceptClassUuid: conceptClassUuid } = useConfig<ExpressWorkflowConfig>();

  const count = useMemo(() => {
    const orders = data?.data?.results ?? [];
    return orders.filter(
      (order) =>
        !order.dateStopped && order.concept.conceptClass.uuid === conceptClassUuid && order.action !== 'DISCONTINUE',
    ).length;
  }, [data, conceptClassUuid]);

  return { count, isLoading, mutate, orders: data?.data?.results ?? [] };
}

function useProcedureOrders(fulfillerStatus?: string) {
  const { proceduresOrderTypeUuid, proceduresConceptClassUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange();
    let apiUrl = `${restBaseUrl}/order?orderTypes=${proceduresOrderTypeUuid}&v=custom:(uuid,concept:(conceptClass),action,dateStopped,fulfillerStatus,encounter:(visit:(uuid,visitType:(uuid))))&isStopped=false`;

    apiUrl += `&activatedOnOrAfterDate=${start}&activatedOnOrBeforeDate=${end}`;

    if (fulfillerStatus) {
      apiUrl += `&fulfillerStatus=${fulfillerStatus}`;
    }

    return apiUrl;
  }, [fulfillerStatus, proceduresOrderTypeUuid]);

  const { data, isLoading, mutate } = useSWR<{ data: { results: Array<any> } }>(url, openmrsFetch, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const count = useMemo(() => {
    const orders = data?.data?.results ?? [];
    return orders.filter((order) => {
      const isProcedureOrder = order.concept.conceptClass.uuid === proceduresConceptClassUuid;
      const isNotDiscontinued = order.action !== 'DISCONTINUE';
      const isNotStopped = !order.dateStopped;

      if (!fulfillerStatus) {
        return (
          isProcedureOrder &&
          isNotDiscontinued &&
          isNotStopped &&
          order.fulfillerStatus === null &&
          order.action === 'NEW'
        );
      } else {
        return isProcedureOrder && isNotDiscontinued && isNotStopped && order.fulfillerStatus === fulfillerStatus;
      }
    }).length;
  }, [data, proceduresConceptClassUuid, fulfillerStatus]);

  return { count, isLoading, mutate, orders: data?.data?.results ?? [] };
}

export const useInvestigationStats = () => {
  const { outpatientVisitTypeUuid } = useConfig<ExpressWorkflowConfig>();

  // Fetch all investigation orders
  const {
    labOrders: newLabOrders,
    isLoading: loadingNewLab,
    mutate: mutateNewLab,
  } = useLabOrders({
    newOrdersOnly: true,
  });

  const {
    labOrders: completedLabOrders,
    isLoading: loadingCompletedLab,
    mutate: mutateCompletedLab,
  } = useLabOrders({
    status: 'COMPLETED',
    excludeCanceled: false,
  });

  const {
    orders: newRadiologyOrders,
    isLoading: loadingNewRadiology,
    mutate: mutateNewRadiology,
  } = useRadiologyOrders();

  const {
    orders: completedRadiologyOrders,
    isLoading: loadingCompletedRadiology,
    mutate: mutateCompletedRadiology,
  } = useRadiologyOrders('COMPLETED');

  const {
    orders: newProcedureOrders,
    isLoading: loadingNewProcedures,
    mutate: mutateNewProcedures,
  } = useProcedureOrders();

  const {
    orders: completedProcedureOrders,
    isLoading: loadingCompletedProcedures,
    mutate: mutateCompletedProcedures,
  } = useProcedureOrders('COMPLETED');

  // Filter all orders by outpatient visit type
  const filteredNewLabOrders = useMemo(
    () => filterOrdersByVisitType(newLabOrders, outpatientVisitTypeUuid),
    [newLabOrders, outpatientVisitTypeUuid],
  );

  const filteredCompletedLabOrders = useMemo(
    () => filterOrdersByVisitType(completedLabOrders, outpatientVisitTypeUuid),
    [completedLabOrders, outpatientVisitTypeUuid],
  );

  const filteredNewRadiologyOrders = useMemo(
    () => filterOrdersByVisitType(newRadiologyOrders, outpatientVisitTypeUuid),
    [newRadiologyOrders, outpatientVisitTypeUuid],
  );

  const filteredCompletedRadiologyOrders = useMemo(
    () => filterOrdersByVisitType(completedRadiologyOrders, outpatientVisitTypeUuid),
    [completedRadiologyOrders, outpatientVisitTypeUuid],
  );

  const filteredNewProcedureOrders = useMemo(
    () => filterOrdersByVisitType(newProcedureOrders, outpatientVisitTypeUuid),
    [newProcedureOrders, outpatientVisitTypeUuid],
  );

  const filteredCompletedProcedureOrders = useMemo(
    () => filterOrdersByVisitType(completedProcedureOrders, outpatientVisitTypeUuid),
    [completedProcedureOrders, outpatientVisitTypeUuid],
  );

  // Calculate counts from filtered orders
  const awaitingCount =
    filteredNewLabOrders.length + filteredNewRadiologyOrders.length + filteredNewProcedureOrders.length;

  const completedCount =
    filteredCompletedLabOrders.length +
    filteredCompletedRadiologyOrders.length +
    filteredCompletedProcedureOrders.length;

  // Single refresh function for all investigations
  const refresh = useCallback(async () => {
    await Promise.all([
      mutateNewLab(),
      mutateCompletedLab(),
      mutateNewRadiology(),
      mutateCompletedRadiology(),
      mutateNewProcedures(),
      mutateCompletedProcedures(),
    ]);
  }, [
    mutateNewLab,
    mutateCompletedLab,
    mutateNewRadiology,
    mutateCompletedRadiology,
    mutateNewProcedures,
    mutateCompletedProcedures,
  ]);

  const isLoading =
    loadingNewLab ||
    loadingCompletedLab ||
    loadingNewRadiology ||
    loadingCompletedRadiology ||
    loadingNewProcedures ||
    loadingCompletedProcedures;

  return {
    awaitingCount,
    completedCount,
    totalCount: awaitingCount + completedCount,
    lab: {
      awaiting: filteredNewLabOrders.length,
      completed: filteredCompletedLabOrders.length,
    },
    radiology: {
      awaiting: filteredNewRadiologyOrders.length,
      completed: filteredCompletedRadiologyOrders.length,
    },
    procedures: {
      awaiting: filteredNewProcedureOrders.length,
      completed: filteredCompletedProcedureOrders.length,
    },
    isLoading,
    refresh,
  };
};

export const useConsultationQueueMetrics = (queue?: Queue) => {
  const { queueServiceConceptUuids, queueStatusConceptUuids, priorities } = useConfig<ExpressWorkflowConfig>();
  const {
    queueEntries: waitingEntries,
    isLoading: isLoadingWaiting,
    error: waitingError,
  } = useQueueEntries({
    service: [queueServiceConceptUuids.consultationService],
    statuses: [queueStatusConceptUuids.waitingStatus, queueStatusConceptUuids.inServiceStatus],
    location: queue?.location?.uuid ? [queue.location.uuid] : undefined,
  });

  const _waitingEntries = useMemo(
    () => waitingEntries.filter((entry) => entry?.queue?.uuid === queue?.uuid),
    [waitingEntries, queue],
  );
  return {
    isLoading: isLoadingWaiting,
    error: waitingError,
    waitingEntries: _waitingEntries,
    emergencyEntries: useMemo(
      () => _waitingEntries.filter((entry) => entry.priority.uuid === priorities?.emergencyPriorityConceptUuid),
      [_waitingEntries, priorities?.emergencyPriorityConceptUuid],
    ),
    urgentEntries: useMemo(
      () => _waitingEntries.filter((entry) => entry.priority.uuid === priorities?.urgentPriorityConceptUuid),
      [_waitingEntries, priorities?.urgentPriorityConceptUuid],
    ),
    notUrgentEntries: useMemo(
      () => _waitingEntries.filter((entry) => entry.priority.uuid === priorities?.notUrgentPriorityConceptUuid),
      [_waitingEntries, priorities?.notUrgentPriorityConceptUuid],
    ),
  };
};
