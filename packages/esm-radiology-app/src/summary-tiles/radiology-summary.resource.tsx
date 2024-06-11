import useSWR, { mutate } from 'swr';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';

import { Result } from '../radiology-tabs/work-list/work-list.resource';
import { useCallback } from 'react';
import { RadiologyConfig } from '../config-schema';

// worklist
export function useProcedureOrderStats(fulfillerStatus: string) {
  const {
    orders: { radiologyOrderTypeUuid },
  } = useConfig<RadiologyConfig>();
  const responseFormat =
    'custom:(uuid,orderNumber,patient:ref,concept:(uuid,display,conceptClass),action,careSetting,orderer:ref,urgency,instructions,commentToFulfiller,display,fulfillerStatus,dateStopped)';
  const orderTypeParam = `orderTypes=${radiologyOrderTypeUuid}&fulfillerStatus=${fulfillerStatus}&v=${responseFormat}`;

  const apiUrl = `/ws/rest/v1/order?${orderTypeParam}`;

  const mutateOrders = useCallback(
    () =>
      mutate(
        (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?orderType=${radiologyOrderTypeUuid}`),
      ),
    [radiologyOrderTypeUuid],
  );

  const { data, error, isLoading } = useSWR<{ data: { results: Array<Result> } }, Error>(apiUrl, openmrsFetch);

  const radiologyOrders = data?.data?.results?.filter((order) => {
    if (order.concept.conceptClass.uuid === '8caa332c-efe4-4025-8b18-3398328e1323') {
      return order;
    }
  });

  let length = 0;

  if (!fulfillerStatus) {
    const processedData = radiologyOrders?.filter((d) => d.fulfillerStatus == null);
    length = processedData?.length;
  } else {
    length = data?.data ? data.data.results.length : 0;
  }
  return {
    count: length,
    isLoading,
    isError: error,
    mutate: mutateOrders,
  };
}
