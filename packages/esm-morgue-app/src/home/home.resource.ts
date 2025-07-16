import {
  FetchResponse,
  openmrsFetch,
  restBaseUrl,
  fhirBaseUrl,
  useConfig,
  useFhirPagination,
} from '@openmrs/esm-framework';
import useSWR from 'swr';
import {
  MappedVisitQueueEntry,
  MortuaryPatient,
  UseVisitQueueEntries,
  VisitQueueEntry,
  MortuaryLocationResponse,
  Entry,
} from '../types';
import React, { useMemo, useEffect, useState } from 'react';
import { ConfigObject } from '../config-schema';

interface MortuaryApiResponse {
  results: MortuaryPatient[];
}

export const useAwaitingQueuePatients = (admissionLocation?: MortuaryLocationResponse) => {
  const { morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();
  const [currPageSize, setCurrPageSize] = useState(10);

  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true`;
  const { isLoading, error, data, mutate } = useSWR<FetchResponse<MortuaryApiResponse>>(url, openmrsFetch);

  const locationUuid = admissionLocation?.ward?.uuid;
  const dischargeUrl =
    locationUuid && morgueDischargeEncounterTypeUuid
      ? `${fhirBaseUrl}/Encounter?_summary=data&type=${morgueDischargeEncounterTypeUuid}&location=${locationUuid}`
      : null;

  const {
    data: dischargeData,
    isLoading: dischargeLoading,
    error: dischargeError,
    mutate: mutateDischarge,
  } = useFhirPagination<Entry>(dischargeUrl, currPageSize);

  const dischargedPatientUuids = useMemo(() => {
    if (!dischargeData || !Array.isArray(dischargeData)) {
      return [];
    }

    const uuids = dischargeData
      .map((entry: Entry) => {
        const reference = entry?.subject?.reference;
        if (reference && reference.startsWith('Patient/')) {
          return reference.split('/')[1];
        }
        return undefined;
      })
      .filter((uuid: string | undefined) => uuid);

    return [...new Set(uuids)];
  }, [dischargeData]);

  const admittedPatientUuids = useMemo(() => {
    if (!admissionLocation?.bedLayouts) {
      return [];
    }

    return admissionLocation.bedLayouts
      .flatMap((bed) => bed.patients?.map((patient) => patient.uuid))
      .filter(Boolean) as string[];
  }, [admissionLocation]);

  const filteredAwaitingPatients = useMemo(() => {
    if (!data?.data?.results) {
      return [];
    }

    return data.data.results.filter((patient) => {
      const patientUuid = patient?.person?.person?.uuid;
      if (!patientUuid) {
        return false;
      }

      if (dischargedPatientUuids.includes(patientUuid)) {
        return false;
      }

      if (admittedPatientUuids.includes(patientUuid)) {
        return false;
      }

      return true;
    });
  }, [data, dischargedPatientUuids, admittedPatientUuids]);

  const admittedPatients = useMemo(() => {
    if (!admissionLocation?.bedLayouts) {
      return [];
    }

    return admissionLocation.bedLayouts.flatMap((bed) => bed.patients || []).filter(Boolean);
  }, [admissionLocation]);

  const { dischargedPatients, dischargedPatientsCount } = useMemo(() => {
    if (!dischargeData || !Array.isArray(dischargeData) || dischargeLoading) {
      return { dischargedPatients: [], dischargedPatientsCount: 0 };
    }

    const discharged = dischargeData.filter((entry) => entry?.subject?.reference);
    return {
      dischargedPatients: discharged,
      dischargedPatientsCount: discharged.length,
    };
  }, [dischargeData, dischargeLoading]);

  const mutateAll = React.useCallback(() => {
    mutate();
    if (mutateDischarge) {
      mutateDischarge();
    }
  }, [mutate, mutateDischarge]);

  return {
    awaitingQueueDeceasedPatients: filteredAwaitingPatients,
    admittedPatients,
    dischargedPatients,
    dischargedPatientsCount,
    isLoadingAwaitingQueuePatients: isLoading,
    isLoadingDischarge: dischargeLoading,
    isLoadingAll: isLoading || dischargeLoading,
    errorFetchingAwaitingQueuePatients: error || dischargeError,
    mutateAwaitingQueuePatients: mutateAll,
    mutateAll,
  };
};

/**
 * Custom hook specifically for awaiting patients (patients without active visits or beds)
 * This hook is now simplified since the filtering is done upstream
 * @param patients - Array of mortuary patients (already filtered by useAwaitingQueuePatients)
 * @returns The same array of patients (already filtered upstream)
 */
export const useAwaitingPatients = (patients: MortuaryPatient[]) => {
  // Since useAwaitingQueuePatients already filters out discharged and admitted patients,
  // we can return the patients as-is
  return patients || [];
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

export function useVisitQueueEntry(patientUuid: string, visitUuid: string): UseVisitQueueEntries {
  const apiUrl = `${restBaseUrl}/visit-queue-entry?v=full&patient=${patientUuid}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(
    apiUrl,
    openmrsFetch,
  );
  const mapVisitQueueEntryProperties = (visitQueueEntry: VisitQueueEntry): MappedVisitQueueEntry => ({
    id: visitQueueEntry.uuid,
    name: visitQueueEntry.queueEntry.queue.display,
    patientUuid: visitQueueEntry.queueEntry.patient.uuid,
    priority:
      visitQueueEntry.queueEntry.priority.display === 'Urgent'
        ? 'Priority'
        : visitQueueEntry.queueEntry.priority.display,
    priorityUuid: visitQueueEntry.queueEntry.priority.uuid,
    service: visitQueueEntry.queueEntry.queue?.display,
    status: visitQueueEntry.queueEntry.status.display,
    statusUuid: visitQueueEntry.queueEntry.status.uuid,
    visitUuid: visitQueueEntry.visit?.uuid,
    visitType: visitQueueEntry.visit?.visitType?.display,
    queue: visitQueueEntry.queueEntry.queue,
    queueEntryUuid: visitQueueEntry.queueEntry.uuid,
  });

  const mappedVisitQueueEntry =
    data?.data?.results
      ?.map(mapVisitQueueEntryProperties)
      .filter((visitQueueEntry) => visitUuid !== undefined && visitUuid === visitQueueEntry.visitUuid)
      .shift() ?? null;
  return {
    queueEntry: mappedVisitQueueEntry,
    isLoading,
    error: error,
    isValidating,
    mutate,
  };
}
