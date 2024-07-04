import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PhamarcyUserMapping, PharmacyUser } from '../types';

const usePharmacyUsers = (pharmacyUuid: string) => {
  const customPresentation = 'full';
  const url = `${restBaseUrl}/datafilter/search`;
  const fetchPharmacyUsers = async (url: string) => {
    const abortController = new AbortController();

    const response = await openmrsFetch(url, {
      body: JSON.stringify({
        entityIdentifier: '',
        entityType: 'org.openmrs.User',
        basisIdentifier: pharmacyUuid,
        basisType: 'org.openmrs.Location',
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
    });
    return response;
  };
  const { data, isLoading, error } = useSWR<FetchResponse<PhamarcyUserMapping[]>>(url, fetchPharmacyUsers);

  return {
    isLoading,
    error,
    users: (data?.data ?? []).map(extractData),
  };
};

const extractData = (mapping: PhamarcyUserMapping) => {
  return {
    name: mapping.entity.name,
    uuid: mapping.entity.uuid,
    telephoneContact: '0787687656',
  } as PharmacyUser;
};

export default usePharmacyUsers;
