import { type FetchResponse, openmrsFetch, restBaseUrl, useFeatureFlag } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type mortuaryLocationFetchResponse } from '../types';
import useMortuaryLocation from './useMortuaryLocations';

const requestRep =
  'custom:(ward,totalBeds,occupiedBeds,bedLayouts:(rowNumber,columnNumber,bedNumber,bedId,bedUuid,status,location,patients:(person:full,identifiers,uuid)))';

export function useAdmissionLocation(rep: string = requestRep) {
  const { location } = useMortuaryLocation();

  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  const apiUrl = location?.uuid ? `${restBaseUrl}/admissionLocation/${location?.uuid}?v=${rep}` : null;
  const { data, ...rest } = useSWR<FetchResponse<mortuaryLocationFetchResponse>, Error>(
    isBedManagementModuleInstalled ? apiUrl : null,
    openmrsFetch,
  );

  return {
    admissionLocation: data?.data,
    ...rest,
  };
}
