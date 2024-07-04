import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PharamacyPatientMapping, PharmacyPatient } from '../types';

const usePharmacyPatients = (pharmacyUuid: string) => {
  const customPresentation = 'full';
  const url = `${restBaseUrl}/datafilter/search`;

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

  const { data, isLoading, error } = useSWR<FetchResponse<PharamacyPatientMapping[]>>(url, fetchPharmacyPatients);

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
    telephoneContact: '0787687656',
    openmrsId: mapping.entity.OpenMRSID,
  } as PharmacyPatient;
};

export default usePharmacyPatients;
