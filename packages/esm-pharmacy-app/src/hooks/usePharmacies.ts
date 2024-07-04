import { FetchResponse, formatDatetime, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Config } from '../config-schema';
import { PhamarcyUserMapping, Pharmacy } from '../types';

const extractPharamacyData = (mapping: PhamarcyUserMapping) => {
  return {
    uuid: mapping.basis.uuid,
    name: mapping.basis.name,
    dateMaped: formatDatetime(new Date(mapping.dateCreated), { mode: 'standard', noToday: true }),
  } as Pharmacy;
};

// TODO Custome representation optimization
const usePharmacies = (userUuid: string) => {
  const config = useConfig<Config>();
  const customeRepresentation = 'full';
  const url = `${restBaseUrl}/datafilter/search`;
  // const url = `${restBaseUrl}/location?tag=${config.admissionLocationTagUuid}&v=${customeRepresentation}`;

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
    pharmacies: (data?.data ?? []).map(extractPharamacyData),
  };
};

export default usePharmacies;
