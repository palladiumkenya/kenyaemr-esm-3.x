import { FetchResponse, fhirBaseUrl, openmrsFetch, parseDate, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { CarePanelConfig } from '../config-schema';
import { useMemo } from 'react';

export interface Entry {
  fullUrl: string;
  resource: Resource;
}

export interface Resource {
  resourceType: string;
  id: string;
  meta: Meta;
  status: string;
  category: Category[];
  code: Code;
  subject: Subject;
  encounter: Encounter;
  effectiveDateTime: string;
  issued: string;
  valueQuantity: ValueQuantity;
  referenceRange: ReferenceRange[];
}

export interface Meta {
  versionId: string;
  lastUpdated: string;
  tag: Tag[];
}

export interface Tag {
  system: string;
  code: string;
  display: string;
}

export interface Category {
  coding: Coding[];
}

export interface Coding {
  system: string;
  code: string;
  display: string;
}

export interface Code {
  coding: CategoryCoding[];
  text: string;
}

export interface CategoryCoding {
  code: string;
  display?: string;
  system?: string;
}

export interface Subject {
  reference: string;
  type: string;
  display: string;
}

export interface Encounter {
  reference: string;
  type: string;
}

export interface ValueQuantity {
  value: number;
  unit: string;
  system: string;
  code: string;
}

export interface ReferenceRange {
  low: Low;
  high: High;
  type: Type;
}

export interface Low {
  value: number;
}

export interface High {
  value: number;
}

export interface Type {
  coding: Coding3[];
}

export interface Coding3 {
  system: string;
  code: string;
}

type DispensingVitals = {
  display: string;
  uuid: string;
  value: number | string;
  dateRecoded?: Date;
};

export const usePatientVitals = (patientUuid: string, encounterUuid: string) => {
  const { dispensingVitalsConcepts } = useConfig<CarePanelConfig>();
  const urlParams = new URLSearchParams({
    patient: patientUuid,
    code: dispensingVitalsConcepts.map(({ uuid }) => uuid).join(','),
    encounter: encounterUuid,
  });
  const url = `${fhirBaseUrl}/Observation?${urlParams.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ entry: Array<Entry> }>>(url, openmrsFetch);
  const vitals = useMemo<Array<DispensingVitals>>(
    () =>
      (data?.data?.entry ?? []).map((entry) => ({
        display: entry?.resource?.code?.text,
        uuid: entry?.resource?.id,
        value: entry?.resource?.valueQuantity?.value,
        dateRecoded: entry?.resource?.issued ? parseDate(entry?.resource?.issued) : undefined,
      })),
    [data],
  );
  return {
    vitals,
    isLoading,
    mutate,
    error,
  };
};
