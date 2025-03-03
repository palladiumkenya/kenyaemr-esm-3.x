import { FetchResponse, openmrsFetch, restBaseUrl, useFhirFetchAll } from '@openmrs/esm-framework';
import { type Patient, type FHIREncounter } from '../types';
import { useAdmissionLocation } from './useMortuaryAdmissionLocation';
import useSWR from 'swr';

export const useDischargedPatient = (dischargeEncounterTypeUuid: string) => {
  const url = dischargeEncounterTypeUuid
    ? `/ws/fhir2/R4/Encounter?_format=json&type=${dischargeEncounterTypeUuid}`
    : null;
  const { data, error, isLoading } = useFhirFetchAll<FHIREncounter>(url);

  const dischargedPatientUuids = data
    ?.map((encounter) => {
      const reference = encounter.subject?.reference;
      if (reference && reference.startsWith('Patient/')) {
        return reference.split('/')[1];
      }
      return undefined;
    })
    .filter((uuid) => uuid);

  const { admissionLocation } = useAdmissionLocation();

  const admittedPatientUuids = admissionLocation?.bedLayouts
    ?.flatMap((bed) => bed.patients?.map((patient) => patient.uuid))
    .filter(Boolean);

  const filteredDischargedPatientUuids = dischargedPatientUuids?.filter(
    (uuid) => !admittedPatientUuids?.includes(uuid),
  );

  const uniqueDischargedPatientUuids = [...new Set(filteredDischargedPatientUuids)];

  return { dischargedPatientUuids: uniqueDischargedPatientUuids, error, isLoading };
};

export const usePatients = (uuids: string[]) => {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(uuid,display),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),attributes:(uuid,display,value,attributeType:(uuid,))))';
  const urls = uuids.map((uuid) => `${restBaseUrl}/patient/${uuid}?v=${customRepresentation}`);

  const { data, error, isLoading } = useSWR<FetchResponse<Patient>[]>(urls, (urls) =>
    Promise.all(urls.map((url) => openmrsFetch<Patient>(url))),
  );

  const deceasedPatients = data?.map((response) => response.data)?.filter((patient) => patient?.person?.dead === true);

  return {
    isLoading,
    error,
    patients: deceasedPatients,
  };
};

export default usePatients;
