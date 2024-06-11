import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { type DurationUnit, type OrderFrequency } from '../../types';

export interface CommonConfigProps {
  uuid: string;
  display: string;
}

export interface OrderConfig {
  durationUnits: Array<CommonConfigProps>;
  orderFrequencies: Array<CommonConfigProps>;
}

export function useOrderConfig(): {
  isLoading: boolean;
  error: Error;
  orderConfigObject: {
    durationUnits: Array<DurationUnit>;
    orderFrequencies: Array<OrderFrequency>;
  };
} {
  const { data, error, isLoading, isValidating } = useSWRImmutable<{ data: OrderConfig }, Error>(
    `${restBaseUrl}/orderentryconfig`,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      orderConfigObject: {
        durationUnits: data?.data?.durationUnits?.map(({ uuid, display }) => ({
          valueCoded: uuid,
          value: display,
        })),
        orderFrequencies: data?.data?.orderFrequencies?.map(({ uuid, display }) => ({
          valueCoded: uuid,
          value: display,
        })),
      },
      isLoading,
      error,
    }),
    [data, error, isLoading],
  );

  return results;
}
