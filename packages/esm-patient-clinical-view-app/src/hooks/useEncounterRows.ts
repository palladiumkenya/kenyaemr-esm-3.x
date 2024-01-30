import useSWRImmutable, { mutate } from 'swr';
import { useCallback, useMemo } from 'react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { encounterRepresentation } from '../maternal-and-child-health/concepts/mch-concepts';
import { OpenmrsEncounter } from '../types';
import isNull from 'lodash-es/isNull';

export interface OpenmrsResource {
  uuid: string;
  display?: string;
  [anythingElse: string]: any;
}

export function useEncounterRows(patientUuid: string, encounterType: string, encounterFilter: (encounter) => boolean) {
  const url = `/ws/rest/v1/encounter?encounterType=${encounterType}&patient=${patientUuid}&v=${encounterRepresentation}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: { results: Array<OpenmrsEncounter> } }, Error>(
    url,
    openmrsFetch,
  );

  // Sort and filter directly in the render
  const sortedAndFilteredEncounters = useMemo(() => {
    if (isNull(data?.data?.results) || !isLoading) {
      const sortedEncounters = sortEncounters(data?.data?.results);
      return encounterFilter ? sortedEncounters.filter(encounterFilter) : sortedEncounters;
    }
    return [];
  }, [data, encounterFilter, isLoading]);

  const onFormSave = useCallback(() => {
    mutate(url);
  }, [url]);

  return {
    encounters: sortedAndFilteredEncounters,
    isLoading,
    error,
    onFormSave,
  };
}

function sortEncounters(encounters: OpenmrsEncounter[]): OpenmrsEncounter[] {
  if (encounters?.length > 0) {
    return [...encounters]?.sort(
      (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
    );
  } else {
    return [];
  }
}
