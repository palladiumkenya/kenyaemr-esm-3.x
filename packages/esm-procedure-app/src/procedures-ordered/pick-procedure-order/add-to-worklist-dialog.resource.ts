import { FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

export interface QueueRoomsResponse {
  uuid: string;
  display: string;
  name: string;
  description: string;
  address1: string;
  address2: string;
  cityvillage: string;
  stateprovince: string;
  country: string;
  postalcode: string;
  latitude: string;
  longitude: string;
  countydistrict: string;
  address3: string;
  address4: string;
  address5: string;
  address6: string;
  parentLocation: ParentLocation;
  childLocations: string[];
  retired: boolean;
  attributes: string[];
  address7: string;
  address8: string;
  address9: string;
  address10: string;
  address11: string;
  address12: string;
  address13: string;
  address14: string;
  address15: string;
  resourceVersion: string;
}

export interface ParentLocation {
  uuid: string;
  display: string;
  name: string;
  description: string;
  address1: string;
  address2: string;
  cityVillage: string;
  stateProvince: string;
  country: string;
  postalcode: string;
  latitude: string;
  longitude: string;
  countydistrict: string;
  address3: string;
  address4: string;
  address5: string;
  address6: string;
  parentLocation: ParentLocation;
  childLocations: ChildLocations[];
  retired: boolean;
  attributes: string[];
  address7: string;
  address8: string;
  address9: string;
  address10: string;
  address11: string;
  address12: string;
  address13: string;
  address14: string;
  address15: string;
  resourceversion: string;
}

export interface ChildLocations {
  uuid: string;
  display: string;
}

export interface ParentLocation {
  uuid: string;
  display: string;
}

// get referral locations
export function useReferralLocations() {
  const config = useConfig();
  const { laboratoryReferalDestinationUuid } = config;
  const apiUrl = `${restBaseUrl}/concept/${laboratoryReferalDestinationUuid}`;
  const { data, isLoading } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    referrals: data ? data?.data?.answers : [],
    isLoading,
  };
}

// update Order
export async function updateOrder(uuid: string, body: any) {
  const abortController = new AbortController();
  return openmrsFetch(`${restBaseUrl}/order/${uuid}/fulfillerdetails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: body,
  });
}
