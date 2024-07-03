import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Pharmacy } from '../types';

const usePharmacy = (pharmacyUuid: string) => {
  const customeRepresentation = 'full';
  const url = `${restBaseUrl}/location/${pharmacyUuid}?v=${customeRepresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Pharmacy>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    pharmacy: data?.data,
  };
};

export default usePharmacy;
