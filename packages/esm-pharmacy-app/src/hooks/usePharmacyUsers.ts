import { FetchResponse, Person, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PharmacyUser } from '../types';

const usePharmacyUsers = (pharmacyUuid: string) => {
  const customPresentation = 'full';
  const url = `${restBaseUrl}/person/?q=&limit=7&v=${customPresentation}`;

  const { data, isLoading, error } = useSWR<FetchResponse<{ results: Person[] }>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    users: (data?.data?.results ?? []).map(extractData),
  };
};

const extractData = (person: Person) => {
  return {
    name: person.preferredName.display,
    uuid: person.uuid,
    age: person.age,
    gender: person.gender,
    telephoneContact: '0787687656',
  } as PharmacyUser;
};

export default usePharmacyUsers;
