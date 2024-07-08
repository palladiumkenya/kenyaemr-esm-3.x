import { FetchResponse, formatDatetime, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PhamarcyUserMapping, Pharmacy } from '../types';

const extractPharmacyData = (mapping: PhamarcyUserMapping) => {
  return {
    uuid: mapping.basis.uuid,
    name: mapping.basis.name,
    dateMaped: formatDatetime(new Date(mapping.dateCreated), { mode: 'standard', noToday: true }),
    cityVillage: mapping.basis.cityVillage,
    countyDistrict: mapping.basis.countyDistrict,
    mflCode: mapping.basis['Master Facility Code'],
  } as Pharmacy;
};

const useUserMappedPharmacies = (userUuid: string) => {
  const url = `${restBaseUrl}/datafilter/search`;

  const fetchUserPharmacies = async (url: string) => {
    const abortController = new AbortController();

    const response = await openmrsFetch(url, {
      body: JSON.stringify({
        entityIdentifier: userUuid,
        entityType: 'org.openmrs.User',
        basisIdentifier: '',
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

  const { isLoading, error, data } = useSWR<FetchResponse<PhamarcyUserMapping[]>>(url, fetchUserPharmacies);

  return {
    isLoading,
    error,
    pharmacies: (data?.data ?? []).map(extractPharmacyData),
  };
};

export default useUserMappedPharmacies;
