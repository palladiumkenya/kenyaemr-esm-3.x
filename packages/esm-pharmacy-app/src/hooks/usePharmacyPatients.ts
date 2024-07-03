import { FetchResponse, Patient, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PharmacyPatient } from '../types';

const usePharmacyPatients = (pharmacyUuid: string) => {
  const customPresentation = 'full';
  const url = `${restBaseUrl}/patient/?q=123&limit=7&v=${customPresentation}`;

  const { data, isLoading, error } = useSWR<FetchResponse<{ results: Patient[] }>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    patients: (data?.data?.results ?? []).map(extractData),
  };
};

const extractData = (patient: Patient) => {
  return {
    name: patient.person.preferredName.display,
    uuid: patient.uuid,
    age: patient.person.age,
    gender: patient.person.gender,
    telephoneContact: '0787687656',
  } as PharmacyPatient;
};

export default usePharmacyPatients;
