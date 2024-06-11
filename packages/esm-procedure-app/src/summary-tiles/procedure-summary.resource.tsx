import useSWR, { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import { ConfigObject, FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';

import { Result } from '../work-list/work-list.resource';
import { useCallback } from 'react';
import { ProcedureConceptClass_UUID } from '../constants';

export function useMetrics() {
  const metrics = {
    orders: 15,
    in_progress: 4,
    transferred: 1,
    completed: 6,
  };
  const { data, error } = useSWR<{ data: { results: any } }, Error>(`${restBaseUrl}/queue?`, openmrsFetch);

  return {
    metrics: metrics,
    isError: error,
    isLoading: !data && !error,
  };
}

export function useProcedureOrderStats(fulfillerStatus: string) {
  const config = useConfig() as ConfigObject;

  const orderTypeParam = `orderTypes=${config.procedureOrderTypeUuid}&isStopped=false&fulfillerStatus=${fulfillerStatus}&v=custom:(uuid,orderNumber,patient:ref,concept:(uuid,display,conceptClass),action,careSetting,orderer:ref,urgency,instructions,commentToFulfiller,display,fulfillerStatus,dateStopped)`;
  const apiUrl = `/ws/rest/v1/order?${orderTypeParam}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Result> } }, Error>(apiUrl, openmrsFetch);

  const mutateOrders = useCallback(() => {
    mutate(apiUrl);
  }, [apiUrl]);

  const procedureOrders = data?.data?.results?.filter((order) => {
    if (fulfillerStatus === '') {
      return (
        order.fulfillerStatus === null &&
        order.dateStopped === null &&
        order.action === 'NEW' &&
        order.concept.conceptClass.uuid === ProcedureConceptClass_UUID
      );
    } else if (fulfillerStatus === 'IN_PROGRESS') {
      return (
        order.fulfillerStatus === 'IN_PROGRESS' &&
        order.dateStopped === null &&
        order.action !== 'DISCONTINUE' &&
        order.concept.conceptClass.uuid === ProcedureConceptClass_UUID
      );
    } else if (fulfillerStatus === 'COMPLETED') {
      return (
        order.fulfillerStatus === 'COMPLETED' &&
        order.dateStopped === null &&
        order.action !== 'DISCONTINUE' &&
        order.concept.conceptClass.uuid === ProcedureConceptClass_UUID
      );
    } else if (fulfillerStatus === 'EXCEPTION') {
      return (
        order.fulfillerStatus === 'EXCEPTION' &&
        order.dateStopped === null &&
        order.action !== 'DISCONTINUE' &&
        order.concept.conceptClass.uuid === ProcedureConceptClass_UUID
      );
    } else if (fulfillerStatus === 'DECLINED') {
      return (
        order.fulfillerStatus === 'DECLINED' &&
        order.dateStopped === null &&
        order.action !== 'DISCONTINUE' &&
        order.concept.conceptClass.uuid === ProcedureConceptClass_UUID
      );
    }
  });
  return {
    count: procedureOrders?.length > 0 ? procedureOrders.length : 0,
    isLoading,
    isError: error,
    mutate: mutateOrders,
  };
}
