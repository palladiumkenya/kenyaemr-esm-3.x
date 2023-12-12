import useSWRImmutable, { mutate } from 'swr';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { encounterRepresentation } from '../esm-mch-app/constants';

export interface OpenmrsResource {
  uuid: string;
  display?: string;
  [anythingElse: string]: any;
}

export interface OpenmrsEncounter extends OpenmrsResource {
  encounterDatetime: Date;
  encounterType: string;
  patient: string;
  location: string;
  encounterProviders?: Array<{ encounterRole: string; provider: string }>;
  obs: Array<OpenmrsResource>;
  form?: string;
  visit?: string;
}

export function useEncounterRows(patientUuid: string, encounterType: string, encounterFilter: (encounter) => boolean) {
  const [encounters, setEncounters] = useState([]);
  const url = useMemo(
    () => `/ws/rest/v1/encounter?encounterType=${encounterType}&patient=${patientUuid}&v=${encounterRepresentation}`,
    [encounterType, patientUuid],
  );

  const {
    data: response,
    error,
    isLoading,
  } = useSWRImmutable<{ data: { results: OpenmrsEncounter[] } }, Error>(url, openmrsFetch);

  useEffect(() => {
    if (response) {
      // sort the encounters
      response.data.results.sort(
        (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
      );
      // apply filter
      if (encounterFilter) {
        setEncounters(response.data.results.filter((encounter) => encounterFilter(encounter)));
      } else {
        setEncounters([...response.data.results]);
      }
    }
  }, [encounterFilter, response]);

  const onFormSave = useCallback(() => {
    mutate(url);
  }, [url]);

  return {
    encounters,
    isLoading,
    error,
    onFormSave,
  };
}
