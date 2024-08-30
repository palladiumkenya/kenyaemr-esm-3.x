import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Patient } from '../types';

const usePatient = (uuid: string) => {
  const customePresentation = 'custom:(uuid,display,links)';
  const url = `${restBaseUrl}/patient/${uuid}?v=${customePresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Patient>>(url, openmrsFetch);
  return { isLoading, error, patient: data?.data };
};

export default usePatient;
