import { FetchResponse, formatDatetime, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PharamacyPatientMapping, PharmacyPatient } from '../types';

const usePharmacyPatients = (pharmacyUuid: string) => {
  const url = `${restBaseUrl}/datafilter/search?type=org.openmrs.Patient`;

  const fetchPharmacyPatients = async (url: string) => {
    const abortController = new AbortController();

    const response = await openmrsFetch(url, {
      body: JSON.stringify({
        entityIdentifier: '',
        entityType: 'org.openmrs.Patient',
        basisIdentifier: pharmacyUuid,
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

  const { data, isLoading, error } = useSWR<FetchResponse<Array<PharamacyPatientMapping>>>(url, fetchPharmacyPatients);

  return {
    isLoading,
    error,
    patients: (data?.data ?? []).map(extractData),
  };
};

const extractData = (mapping: PharamacyPatientMapping) => {
  return {
    name: mapping.entity.name,
    uuid: mapping.entity.uuid,
    age: mapping.entity.age,
    gender: mapping.entity.gender,
    telephoneContact: mapping.entity['Telephone contact'],
    openmrsId: mapping.entity.OpenMRSID,
    dateMapped: formatDatetime(new Date(mapping.dateCreated), { mode: 'standard', noToday: true }),
  } as PharmacyPatient;
};

export default usePharmacyPatients;
