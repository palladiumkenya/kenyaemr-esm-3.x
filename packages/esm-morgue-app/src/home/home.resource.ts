import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { MortuaryPatient } from '../typess';
import { useMemo, useEffect, useState } from 'react';

interface MortuaryApiResponse {
  results: MortuaryPatient[];
}

export const useAwaitingQueuePatients = () => {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true`;
  const { isLoading, error, data, mutate } = useSWR<FetchResponse<MortuaryApiResponse>>(url, openmrsFetch);

  return {
    awaitingQueueDeceasedPatients: data?.data?.results || [],
    isLoadingAwaitingQueuePatients: isLoading,
    errorFetchingAwaitingQueuePatients: error,
    mutateAwaitingQueuePatients: mutate,
  };
};

/**
 * Fetches visit data for multiple patients
 * @param patientUuids - Array of patient UUIDs
 * @returns Promise that resolves to a record of visit statuses
 */
const fetchPatientVisits = async (patientUuids: string[]) => {
  const visitPromises = patientUuids.map(async (uuid) => {
    try {
      const response = await openmrsFetch(`${restBaseUrl}/visit?patient=${uuid}&includeInactive=false`);
      return {
        uuid,
        hasActiveVisit: response.data?.results?.length > 0,
      };
    } catch (error) {
      console.error(`Error fetching visit for patient ${uuid}:`, error);
      return { uuid, hasActiveVisit: false };
    }
  });

  const visits = await Promise.all(visitPromises);
  return visits.reduce((acc, { uuid, hasActiveVisit }) => {
    acc[uuid] = hasActiveVisit;
    return acc;
  }, {} as Record<string, boolean>);
};

/**
 * Custom hook to filter mortuary patients based on their visit status
 * @param patients - Array of mortuary patients
 * @returns Object containing filtered patients for different statuses
 */
export const useFilteredPatients = (patients: MortuaryPatient[]) => {
  const [visitData, setVisitData] = useState<Record<string, boolean>>({});
  const patientUuids = useMemo(() => {
    return patients.map((patient) => patient?.person?.person?.uuid).filter(Boolean) as string[];
  }, [patients]);

  useEffect(() => {
    if (patientUuids.length > 0) {
      fetchPatientVisits(patientUuids).then(setVisitData);
    }
  }, [patientUuids]);

  return useMemo(() => {
    if (!patients || patients.length === 0) {
      return {
        awaitingAdmission: [],
        admitted: [],
        all: [],
      };
    }

    const awaitingAdmission: MortuaryPatient[] = [];
    const admitted: MortuaryPatient[] = [];

    patients.forEach((patient) => {
      const patientUuid = patient?.person?.person?.uuid;
      if (!patientUuid) {
        return;
      }

      if (visitData[patientUuid]) {
        admitted.push(patient);
      } else {
        awaitingAdmission.push(patient);
      }
    });

    return {
      awaitingAdmission,
    };
  }, [patients, visitData]);
};

/**
 * Custom hook specifically for awaiting patients (patients without active visits)
 * @param patients - Array of mortuary patients
 * @returns Filtered array of patients awaiting admission
 */
export const useAwaitingPatients = (patients: MortuaryPatient[]) => {
  const { awaitingAdmission } = useFilteredPatients(patients);
  return awaitingAdmission;
};
