import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
interface DeceasedInfo {
  uuid: string;
  display: string;
  identifiers: Array<{
    identifier: string;
    uuid: string;
    preferred: boolean;
    location: {
      uuid: string;
      name: string;
    };
  }>;
  person: {
    uuid: string;
    display: string;
    gender: string;
    birthdate: string;
    dead: boolean;
    age: number;
    deathDate: string | null;
    causeOfDeath: {
      uuid: string;
      display: string;
    } | null;
    preferredAddress: {
      uuid: string;
      stateProvince: string | null;
      countyDistrict: string | null;
      address4: string | null;
    } | null;
  };
}
interface DeceasedPatientResponse {
  results: DeceasedInfo[];
}

export const useDeceasedPatient = (deceasedPatientName: String) => {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `/ws/rest/v1/patient?v=${customRepresentation}&dead=true&q=test`;
  const { data, error, isLoading, mutate } = useSWRImmutable<{ data: DeceasedPatientResponse }>(url, openmrsFetch);

  const deceasedPatient = data?.data?.results || null;

  return { data: deceasedPatient, error, isLoading, mutate };
};
