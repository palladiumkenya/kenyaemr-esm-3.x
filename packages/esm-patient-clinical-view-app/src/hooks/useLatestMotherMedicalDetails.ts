import React, { useMemo } from 'react';
import useSWR from 'swr';
import { ConfigObject } from '../config-schema';
import { FetchResponse, fhirBaseUrl, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';

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
  coding: CategoryCoding[];
}

export interface CategoryCoding {
  system: string;
  code: string;
  display: string;
}

export interface Code {
  coding: Coding[];
  text: string;
}

export interface Coding {
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
}

export interface ReferenceRange {
  low: Low;
  type: Type;
}

export interface Low {
  value: number;
}

export interface Type {
  coding: TypeCoding[];
}

export interface TypeCoding {
  system: string;
  code: string;
}

const useLatestMotherMedicalDetails = (patientUuid: string) => {
  const {
    concepts: { motherMedicalHistoryConcepts },
  } = useConfig<ConfigObject>();
  const urlParams = new URLSearchParams({
    patient: patientUuid,
    code: motherMedicalHistoryConcepts.map((c) => c.uuid).join(','),
    max: '1',
    _summary: 'data',
  });

  const url = `${fhirBaseUrl}/Observation/$lastn?${urlParams.toString()}`;

  const { data, isLoading, error } = useSWR<FetchResponse<{ entry: Array<Entry> }>>(url, openmrsFetch);

  const obs = useMemo(
    () =>
      (data?.data?.entry ?? []).map((entry) => {
        return {
          uuid: entry?.resource?.id,
          display: entry?.resource?.code?.text,
          value: entry?.resource?.valueQuantity?.value,
          unit: entry.resource.valueQuantity.unit,
          obsDate: entry?.resource?.issued,
        };
      }),
    [data],
  );

  return {
    data: obs,
    isLoading,
    error,
  };
};

export default useLatestMotherMedicalDetails;
