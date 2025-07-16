import { FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import { type MortuaryLocationResponse, type AdmissionLocationResponse, type Bed, type MappedBedData } from '../types';
import { ConfigObject } from '../config-schema';

export const useLocation = () => {
  const { mortuaryLocationTagUuid } = useConfig<ConfigObject>();
  const url = `${restBaseUrl}/admissionLocation?v=full`;
  const { isLoading, error, data, mutate } = useSWR<FetchResponse<AdmissionLocationResponse>>(url, openmrsFetch);

  const mortuaryLocations = useMemo(() => {
    if (!data?.data?.results || !mortuaryLocationTagUuid) {
      return [];
    }

    return data.data.results.filter((location) =>
      location.ward.tags.some((tag) => tag.uuid === mortuaryLocationTagUuid),
    );
  }, [data?.data?.results, mortuaryLocationTagUuid]);

  return {
    locations: mortuaryLocations,
    isLoading,
    error,
    mutate,
  };
};

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

export function useMortuaryAdmissionLocation(locationUuid: string) {
  const customRepresentation =
    'custom:(ward,totalBeds,occupiedBeds,bedLayouts:(rowNumber,columnNumber,bedNumber,bedType,bedId,bedUuid,status,location,patients:(person:full,identifiers,uuid)))';

  const url = locationUuid ? `${restBaseUrl}/admissionLocation/${locationUuid}?v=${customRepresentation}` : null;

  const { data, ...rest } = useSWR<FetchResponse<MortuaryLocationResponse>, Error>(url, openmrsFetch);

  return {
    admissionLocation: data?.data,
    ...rest,
  };
}
