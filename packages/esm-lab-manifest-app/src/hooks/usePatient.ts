import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

const usePatient = (patientUuid: string) => {
  const customerep = 'custom:(person:(display),identifiers:(identifier,identifierType:(uuid)))';
  const url = `${restBaseUrl}/patient/${patientUuid}?v=${customerep}`;
  const { data, error, isLoading } = useSWR<
    FetchResponse<{
      person: { display: string };
      identifiers: Array<{ identifier: string; identifierType: { uuid: string } }>;
    }>
  >(url, openmrsFetch);
  return { patient: data?.data, error, isLoading };
};

export default usePatient;
