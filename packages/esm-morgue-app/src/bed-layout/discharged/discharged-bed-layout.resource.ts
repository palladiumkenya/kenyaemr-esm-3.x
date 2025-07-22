import { FetchResponse, fhirBaseUrl, openmrsFetch, restBaseUrl, useFhirPagination } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Patient, MortuaryLocationResponse, Entry } from '../../types';
import { useMemo, useState } from 'react';
import { parseDisplayText } from '../../utils/utils';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';

export const useMortuaryDischargeEncounter = (
  dischargeEncounterTypeUuid: string,
  admissionLocation: MortuaryLocationResponse,
) => {
  const [currPageSize, setCurrPageSize] = useState(100);
  const locationUuid = admissionLocation?.ward?.uuid;

  const urls = !admissionLocation
    ? null
    : `${fhirBaseUrl}/Encounter?_summary=data&type=${dischargeEncounterTypeUuid}&location=${locationUuid}`;

  const { data, isLoading, error, paginated, currentPage, goTo, totalCount, currentPageSize, mutate } =
    useFhirPagination<Entry>(urls, currPageSize);

  const currentItems = useMemo(() => {
    if (!data) {
      return 0;
    }
    return data.length;
  }, [data]);

  const { pageSizes: calculatedPageSizes, itemsDisplayed } = usePaginationInfo(
    currPageSize,
    totalCount || 0,
    currentPage || 1,
    currentItems,
  );

  const dischargedPatientUuids = useMemo(() => {
    if (!data) {
      return [];
    }

    const uuids = data
      .map((entry) => {
        const reference = entry?.subject?.reference;
        if (reference && reference.startsWith('Patient/')) {
          return reference.split('/')[1];
        }
        return undefined;
      })
      .filter((uuid) => uuid);

    const admittedPatientUuids = admissionLocation?.bedLayouts
      ?.flatMap((bed) => bed.patients?.map((patient) => patient.uuid))
      .filter(Boolean);

    const filteredDischargedPatientUuids = uuids?.filter((uuid) => !admittedPatientUuids?.includes(uuid));

    return [...new Set(filteredDischargedPatientUuids)];
  }, [data, admissionLocation]);

  const encounters = useMemo(() => {
    return (data ?? []).map((entry) => {
      const { name, openmrsId } = parseDisplayText(entry.subject.display);
      const patientUuid = entry.subject.reference.split('/').at(-1);
      return {
        uuid: entry?.id,
        patient: { uuid: patientUuid, openmrsId, name },
        encounterDateTime: entry.period?.start,
      };
    });
  }, [data]);

  return {
    encounters,
    dischargedPatientUuids,
    isLoading: isLoading,
    error: error,
    paginated,
    currentPage,
    pageSizes: calculatedPageSizes,
    itemsDisplayed,
    goTo,
    currPageSize,
    setCurrPageSize,
    totalCount,
    currentPageSize,
    mutate,
  };
};

export const usePatients = (uuids: string[]) => {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(uuid,display),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),attributes:(uuid,display,value,attributeType:(uuid,))))';
  const urls = uuids.map((uuid) => `${restBaseUrl}/patient/${uuid}?v=${customRepresentation}`);

  const { data, error, isLoading, mutate } = useSWR<FetchResponse<Patient>[]>(urls, (urls) =>
    Promise.all(urls.map((url) => openmrsFetch<Patient>(url))),
  );

  const deceasedPatients = data?.map((response) => response.data)?.filter((patient) => patient?.person?.dead === true);

  return {
    isLoading,
    error,
    patients: deceasedPatients,
    mutate,
  };
};

export default usePatients;
