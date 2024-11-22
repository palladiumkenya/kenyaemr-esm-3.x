import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Patient } from '../../types';

const usePerson = (uuid: string) => {
  const customRepresentation = `custom:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display))`;
  const url = `${restBaseUrl}/person/${uuid}?v=${customRepresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Patient['person']>>(url, openmrsFetch);
  const person = data?.data;
  return { isLoading, error, person };
};

export default usePerson;
