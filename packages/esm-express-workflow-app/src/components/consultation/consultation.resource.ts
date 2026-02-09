import { openmrsFetch, restBaseUrl, useConfig, Visit } from '@openmrs/esm-framework';
import { FulfillerStatus, Order } from '@openmrs/esm-patient-common-lib';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { Queue, QueueEntry } from '../../types';
import { ExpressWorkflowConfig } from '../../config-schema';
import { useQueueEntries } from '../../hooks/useServiceQueues';

export interface UseLabOrdersParams {
  status?: FulfillerStatus;
  newOrdersOnly?: boolean;
  excludeCanceled?: boolean;
}

const getTodayRange = (daysBack: number = 0) => ({
  start: dayjs().subtract(daysBack, 'day').startOf('day').toISOString(),
  end: dayjs().endOf('day').toISOString(),
});

export const useTotalVisits = () => {
  const customRepresentation = 'custom:(uuid,startDatetime,stopDatetime,visitType:(uuid,display))';

  const visitsUrl = `${restBaseUrl}/visit?includeInactive=true&v=${customRepresentation}&fromStartDate=${dayjs().format(
    'YYYY-MM-DD',
  )}`;

  const { data, error, isLoading, mutate, isValidating } = useSWR<{ data: { results: Array<Visit> } }>(
    visitsUrl,
    openmrsFetch,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    },
  );

  return {
    data: data?.data?.results,
    error,
    isLoading,
    mutate,
    isValidating,
  };
};

export function useLabOrders(params: UseLabOrdersParams = {}) {
  const { status, excludeCanceled = true } = params;
  const { labOrderTypeUuid, outpatientVisitTypeUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange(1);
    let apiUrl = `${restBaseUrl}/order?orderTypes=${labOrderTypeUuid}&v=custom:(uuid,patient:(uuid,display),action,dateStopped,fulfillerStatus,encounter:(visit:(uuid,visitType:(uuid))))`;

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

  const orders = useMemo(() => {
    return (data?.data?.results ?? []).filter((order) => {
      const isOutpatientVisit = order?.encounter?.visit?.visitType?.uuid === outpatientVisitTypeUuid;
      const isNotStopped = order.dateStopped === null;
      if (!status) {
        return isOutpatientVisit && isNotStopped && order.fulfillerStatus === null && order.action === 'NEW';
      }
      return isOutpatientVisit && isNotStopped && order.fulfillerStatus === status && order.action !== 'DISCONTINUE';
    });
  }, [data, outpatientVisitTypeUuid, status]);

  return {
    labOrders: orders,
    isLoading,
    isError: error,
    mutate,
  };
}

function useRadiologyOrders(fulfillerStatus?: string) {
  const { imagingOrderTypeUuid, imagingConceptClassUuid, outpatientVisitTypeUuid } = useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange(1);
    let apiUrl = `${restBaseUrl}/order?orderTypes=${imagingOrderTypeUuid}&v=custom:(uuid,patient:(uuid,display),concept:(conceptClass),action,dateStopped,fulfillerStatus,encounter:(visit:(uuid,visitType:(uuid))))`;

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

  const orders = useMemo(() => {
    return (data?.data?.results ?? []).filter((order) => {
      const isConceptClass = order.concept.conceptClass.uuid === conceptClassUuid;
      const isOutpatientVisit = order?.encounter?.visit?.visitType?.uuid === outpatientVisitTypeUuid;
      const isNotStopped = order.dateStopped === null;
      if (!fulfillerStatus) {
        return (
          isConceptClass &&
          isOutpatientVisit &&
          isNotStopped &&
          order.fulfillerStatus === null &&
          order.action === 'NEW'
        );
      }
      return (
        isConceptClass &&
        isOutpatientVisit &&
        isNotStopped &&
        order.fulfillerStatus === fulfillerStatus &&
        order.action !== 'DISCONTINUE'
      );
    });
  }, [data, outpatientVisitTypeUuid, conceptClassUuid, fulfillerStatus]);

  return {
    isLoading,
    mutate,
    orders,
  };
}

function useProcedureOrders(fulfillerStatus?: string) {
  const { proceduresOrderTypeUuid, proceduresConceptClassUuid, outpatientVisitTypeUuid } =
    useConfig<ExpressWorkflowConfig>();

  const url = useMemo(() => {
    const { start, end } = getTodayRange(1);
    let apiUrl = `${restBaseUrl}/order?orderTypes=${proceduresOrderTypeUuid}&v=custom:(uuid,patient:(uuid,display),concept:(conceptClass),action,dateStopped,fulfillerStatus,encounter:(visit:(uuid,visitType:(uuid))))&isStopped=false`;

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

  const orders = useMemo(() => {
    return (data?.data?.results ?? []).filter((order) => {
      const isProcedureOrder = order.concept.conceptClass.uuid === proceduresConceptClassUuid;
      const isOutpatientVisit = order?.encounter?.visit?.visitType?.uuid === outpatientVisitTypeUuid;
      const isNotStopped = order.dateStopped === null;
      if (!fulfillerStatus) {
        return (
          isProcedureOrder &&
          isOutpatientVisit &&
          isNotStopped &&
          order.fulfillerStatus === null &&
          order.action === 'NEW'
        );
      }
      return (
        isProcedureOrder &&
        isOutpatientVisit &&
        isNotStopped &&
        order.fulfillerStatus === fulfillerStatus &&
        order.action !== 'DISCONTINUE'
      );
    });
  }, [data, outpatientVisitTypeUuid, proceduresConceptClassUuid, fulfillerStatus]);

  return {
    isLoading,
    mutate,
    orders,
  };
}

export const useInvestigationStats = (queue?: Queue) => {
  const { isLoading: isLoadingQueueMetrics, waitingEntries, isValidating } = useConsultationQueueMetrics(queue);

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

  const investigationCategorizedEntries = useMemo(() => {
    return waitingEntries?.reduce<{
      newLabOrders: QueueEntry[];
      newRadiologyOrders: QueueEntry[];
      newProcedureOrders: QueueEntry[];
      completedLabOrders: QueueEntry[];
      completedRadiologyOrders: QueueEntry[];
      completedProcedureOrders: QueueEntry[];
    }>(
      (acc, entry) => {
        const hasNewLabOrder = newLabOrders.find((order) => order.patient.uuid === entry.patient.uuid);
        const hasNewRadiologyOrder = newRadiologyOrders.find((order) => order.patient.uuid === entry.patient.uuid);
        const hasNewProcedureOrder = newProcedureOrders.find((order) => order.patient.uuid === entry.patient.uuid);
        const hasCompletedLabOrder = completedLabOrders.find((order) => order.patient.uuid === entry.patient.uuid);
        const hasCompletedRadiologyOrder = completedRadiologyOrders.find(
          (order) => order.patient.uuid === entry.patient.uuid,
        );
        const hasCompletedProcedureOrder = completedProcedureOrders.find(
          (order) => order.patient.uuid === entry.patient.uuid,
        );

        if (hasNewLabOrder) {
          acc.newLabOrders.push(entry);
        }
        if (hasNewRadiologyOrder) {
          acc.newRadiologyOrders.push(entry);
        }
        if (hasNewProcedureOrder) {
          acc.newProcedureOrders.push(entry);
        }
        if (hasCompletedLabOrder) {
          acc.completedLabOrders.push(entry);
        }
        if (hasCompletedRadiologyOrder) {
          acc.completedRadiologyOrders.push(entry);
        }
        if (hasCompletedProcedureOrder) {
          acc.completedProcedureOrders.push(entry);
        }
        return acc;
      },
      {
        newLabOrders: [],
        newRadiologyOrders: [],
        newProcedureOrders: [],
        completedLabOrders: [],
        completedRadiologyOrders: [],
        completedProcedureOrders: [],
      },
    );
  }, [
    waitingEntries,
    newLabOrders,
    newRadiologyOrders,
    newProcedureOrders,
    completedLabOrders,
    completedRadiologyOrders,
    completedProcedureOrders,
  ]);

  // Calculate counts from filtered orders
  // const awaitingCount = newLabOrders.length + newRadiologyOrders.length + newProcedureOrders.length;
  const awaitingCount = useMemo(() => {
    const patients = new Set<string>();
    investigationCategorizedEntries.newLabOrders.forEach((entry) => {
      patients.add(entry.patient.uuid);
    });
    investigationCategorizedEntries.newRadiologyOrders.forEach((entry) => {
      patients.add(entry.patient.uuid);
    });
    investigationCategorizedEntries.newProcedureOrders.forEach((entry) => {
      patients.add(entry.patient.uuid);
    });
    return patients.size;
  }, [investigationCategorizedEntries]);

  // const completedCount = completedLabOrders.length + completedRadiologyOrders.length + completedProcedureOrders.length;
  const completedCount = useMemo(() => {
    const patients = new Set<string>();
    investigationCategorizedEntries.completedLabOrders.forEach((entry) => {
      patients.add(entry.patient.uuid);
    });
    investigationCategorizedEntries.completedRadiologyOrders.forEach((entry) => {
      patients.add(entry.patient.uuid);
    });
    investigationCategorizedEntries.completedProcedureOrders.forEach((entry) => {
      patients.add(entry.patient.uuid);
    });
    return patients.size;
  }, [investigationCategorizedEntries]);

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
    loadingCompletedProcedures ||
    isLoadingQueueMetrics;

  return {
    awaitingCount,
    completedCount,
    totalCount: awaitingCount + completedCount,
    lab: {
      awaiting: investigationCategorizedEntries.newLabOrders.length,
      completed: investigationCategorizedEntries.completedLabOrders.length,
    },
    radiology: {
      awaiting: investigationCategorizedEntries.newRadiologyOrders.length,
      completed: investigationCategorizedEntries.completedRadiologyOrders.length,
    },
    procedures: {
      awaiting: investigationCategorizedEntries.newProcedureOrders.length,
      completed: investigationCategorizedEntries.completedProcedureOrders.length,
    },
    isLoading,
    refresh,
    investigationCategorizedEntries,
    isValidating,
  };
};

export const useConsultationQueueMetrics = (queue?: Queue) => {
  const { queueServiceConceptUuids, queueStatusConceptUuids, priorities } = useConfig<ExpressWorkflowConfig>();
  const {
    queueEntries: waitingEntries,
    isLoading: isLoadingWaiting,
    isValidating: isValidatingWaiting,
    error: waitingError,
  } = useQueueEntries({
    service: [queueServiceConceptUuids.consultationService],
    statuses: [queueStatusConceptUuids.waitingStatus, queueStatusConceptUuids.inServiceStatus],
    location: queue?.location?.uuid ? [queue.location.uuid] : undefined,
    startedOnOrAfter: dayjs().subtract(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
  });

  const _waitingEntries = useMemo(
    () => waitingEntries.filter((entry) => entry?.queue?.uuid === queue?.uuid),
    [waitingEntries, queue],
  );

  return {
    isLoading: isLoadingWaiting,
    error: waitingError,
    waitingEntries: _waitingEntries,
    isValidating: isValidatingWaiting,
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
