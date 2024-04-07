import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Encounter } from '../../ui/encounter-list/encounter.resource';

export const useEncounters = (encounterUuid: string, formUuid: string, patientUuid: string) => {
  const url = `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${encounterUuid}&form=${formUuid}&v=full`;
  const { data, isLoading, isValidating, error, mutate } = useSWR<{ data: { results: Array<Encounter> } }>(
    encounterUuid && formUuid ? url : null,
    openmrsFetch,
  );
  const filteredByEncounterTypeUuid =
    data?.data?.results.filter(
      (encounter) => encounter.encounterType.uuid === encounterUuid && encounter.form.uuid === formUuid,
    ) ?? [];
  return { encounters: filteredByEncounterTypeUuid, isLoading, isValidating, error, mutate };
};

export const genericTableHeader = [
  { key: 'encounterDatetime', header: 'Date & time' },
  { key: 'visitType', header: 'Visit Type' },
  { key: 'provider', header: 'Provider' },
];
