import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Encounter } from './encounter-observations/visit.resource';
import { BedManagementConfig } from '../config-schema';

export const usePatientEncounters = (patientUuid: string) => {
  const { inPatientForms } = useConfig<BedManagementConfig>();
  const { data, isLoading, error, mutate } = useSWR<{
    data: { results: Array<Encounter> };
  }>(
    `/ws/rest/v1/encounter?patient=${patientUuid}&v=custom:(uuid,display,encounterDatetime,obs:full,form:(uuid,display),encounterType:(uuid,display),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display))),orders:(uuid,display),diagnoses:(uuid,display)`,
    openmrsFetch,
  );

  const encounters =
    data?.data?.['results']?.filter((encounter) =>
      inPatientForms?.find((form) => form.uuid === encounter?.form?.uuid),
    ) ?? [];

  return {
    encounters: encounters,
    isLoading,
    error,
    mutate,
  };
};
