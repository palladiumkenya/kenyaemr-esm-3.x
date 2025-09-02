import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useConfig, useOpenmrsPagination, type Encounter } from '@openmrs/esm-framework';

import { MappedAdrEncounter } from '../../types';
import { type ADRConfigObject } from '../../config-schema';

export const useAdrAssessmentEncounter = (fromDate: string, toDate?: string) => {
  const url = `${restBaseUrl}/kenyaemr/adrencounter?fromdate=${fromDate}&todate=${toDate}`;
  const { data, error, isLoading } = useSWR<{ data: Array<MappedAdrEncounter> }>(url, openmrsFetch);
  return {
    encounters: data?.data ?? [],
    isLoading,
    error,
  };
};

export const usePatientAdrAssessmentEncounter = (patientUuid: string) => {
  const { adrAssessmentEncounterTypeUuid } = useConfig<ADRConfigObject>();
  const url = `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${adrAssessmentEncounterTypeUuid}&v=full`;
  const pageSize = 10;
  const { data, error, isLoading, paginated, currentPage, goTo, totalCount, currentPageSize, mutate } =
    useOpenmrsPagination<Encounter>(url, pageSize);

  const mappedEncounters: Array<MappedAdrEncounter> = data?.map((encounter) => ({
    encounterUuid: encounter.uuid,
    encounterTypeUuid: encounter.encounterType?.uuid,
    patientUuid: encounter.patient?.uuid,
    patientName: encounter.patient?.display,
    encounterType: encounter.encounterType?.name,
    encounterDatetime: encounter.encounterDatetime,
    visitTypeName: encounter.visit?.visitType?.display,
    formName: encounter.form?.display,
    location: encounter.location?.display,
    provider: encounter.encounterProviders?.map((provider) => provider.provider?.display).join(', '),
    formUuid: encounter.form?.uuid,
    visitUuid: encounter.visit?.uuid,
    visitTypeUuid: encounter.visit?.visitType?.uuid,
  }));
  return {
    encounters: mappedEncounters ?? [],
    isLoading,
    error,
    paginated,
    currentPage,
    goTo,
    totalCount,
    currentPageSize,
    mutate,
  };
};
