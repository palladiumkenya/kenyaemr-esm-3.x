import {
  type FetchResponse,
  openmrsFetch,
  restBaseUrl,
  useFeatureFlag,
  type Location,
  useSession,
} from '@openmrs/esm-framework';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { useParams } from 'react-router-dom';
import { type MortuaryLocationFetchResponse, type FHIREncounter } from '../types';

export function useLocation(locationUuid: string, rep: string = 'custom:(display,uuid)') {
  return useSWRImmutable<FetchResponse<Location>>(
    locationUuid ? `${restBaseUrl}/location/${locationUuid}?v=${rep}` : null,
    openmrsFetch,
  );
}

export function useMortuaryLocation(): {
  location: Location | undefined;
  isLoadingLocation: boolean;
  errorFetchingLocation: Error | undefined;
  invalidLocation: boolean;
} {
  const { locationUuid: locationUuidFromUrl } = useParams();
  const { sessionLocation } = useSession();

  const {
    data: locationResponse,
    isLoading: isLoadingLocation,
    error: errorFetchingLocation,
  } = useLocation(locationUuidFromUrl ?? null);

  const invalidLocation = !!locationUuidFromUrl && !!errorFetchingLocation;

  return {
    location: locationUuidFromUrl ? locationResponse?.data : sessionLocation,
    isLoadingLocation,
    errorFetchingLocation,
    invalidLocation,
  };
}

const requestRep =
  'custom:(ward,totalBeds,occupiedBeds,bedLayouts:(rowNumber,columnNumber,bedNumber,bedId,bedUuid,status,location,patients:(person:full,identifiers,uuid)))';

export function useAdmissionLocation(rep: string = requestRep) {
  const { location } = useMortuaryLocation();
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  const apiUrl = location?.uuid ? `${restBaseUrl}/admissionLocation/${location.uuid}?v=${rep}` : null;

  const { data, ...rest } = useSWR<FetchResponse<MortuaryLocationFetchResponse>, Error>(
    isBedManagementModuleInstalled ? apiUrl : null,
    openmrsFetch,
  );

  return {
    admissionLocation: data?.data,
    ...rest,
  };
}
