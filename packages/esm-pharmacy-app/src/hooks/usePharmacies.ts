import { FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Config } from '../config-schema';
import { Pharmacy } from '../types';

// TODO Custome representation optimization
const useRegistrationTaggedPharmacies = () => {
  const config = useConfig<Config>();
  const customeRepresentation = 'full';
  const url = `${restBaseUrl}/location?tag=${config.admissionLocationTagUuid}&v=${customeRepresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<{ results: Pharmacy[] }>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    pharmacies: data?.data?.results ?? [],
  };
};

export default useRegistrationTaggedPharmacies;
