import React, { useMemo } from 'react';
import useSWR from 'swr';
import { ConfigObject } from '../config-schema';
import { FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';

export interface Obs {
  uuid: string;
  display: string;
  obsDatetime: string;
  concept: Concept;
  value?: number | string | { uuid: string; display: string };
}

export interface Concept {
  uuid: string;
  display: string;
}

const useLatestMotherMedicalDetails = (patientUuid: string) => {
  const customrep = `custom:(uuid,display,obsDatetime,concept:(uuid,display,datatype:(display)),value:(uuid,display),comment)`;
  const {
    concepts: { motherMedicalHistoryConcepts },
  } = useConfig<ConfigObject>();
  const url = `${restBaseUrl}/obs?patient=${patientUuid}&v=${customrep}&concepts=${motherMedicalHistoryConcepts
    .map((m) => m.uuid)
    .join(',')}`;
  const { data, isLoading, error } = useSWR<FetchResponse<{ results: Array<Obs> }>>(url, openmrsFetch);

  const obs = useMemo(
    () =>
      (data?.data?.results ?? []).reduce<Array<Obs>>((prev, curr) => {
        const existing = prev.find((o) => o.concept.uuid === curr.concept.uuid);
        if (!existing || new Date(existing.obsDatetime) < new Date(curr.obsDatetime)) {
          return prev.filter((o) => o.concept.uuid !== curr.concept.uuid).concat(curr);
        }
        return prev;
      }, []),
    [data],
  );
  return {
    data: obs,
    isLoading,
    error,
  };
};

export default useLatestMotherMedicalDetails;
