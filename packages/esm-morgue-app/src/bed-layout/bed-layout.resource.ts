import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework/src';
import { useMemo } from 'react';
import useSWR from 'swr';

export const useBedsForLocation = (locationUuid: string) => {
  const apiUrl = `${restBaseUrl}/bed?locationUuid=${locationUuid}&v=full`;

  const { data, isLoading, error, mutate, isValidating } = useSWR<{ data: { results: Array<Bed> } }, Error>(
    locationUuid ? apiUrl : null,
    openmrsFetch,
  );

  const mappedBedData: MappedBedData = (data?.data?.results ?? []).map((bed) => ({
    id: bed.id,
    type: bed.bedType?.displayName,
    number: bed.bedNumber,
    status: bed.status,
    uuid: bed.uuid,
  }));

  const results = useMemo(
    () => ({
      bedsData: mappedBedData,
      errorLoadingBeds: error,
      isLoadingBeds: isLoading,
      mutate,
      isValidating,
    }),
    [mappedBedData, isLoading, error, mutate, isValidating],
  );

  return results;
};
