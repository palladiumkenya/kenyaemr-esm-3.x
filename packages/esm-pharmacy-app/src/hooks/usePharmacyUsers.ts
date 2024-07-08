import { FetchResponse, formatDatetime, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PhamarcyUserMapping, PharmacyUser } from '../types';

const usePharmacyUsers = (pharmacyUuid: string) => {
  const customPresentation = 'full';
  const url = `${restBaseUrl}/datafilter/search?type=org.openmrs.User`;
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
    dateMapped: formatDatetime(new Date(mapping.dateCreated), { mode: 'standard', noToday: true }),
  } as PharmacyUser;
};

export default usePharmacyUsers;
