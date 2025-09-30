import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { mockInterventions, mockPackages } from './claims-form.mocks';
import z from 'zod';

interface Provider {
  uuid: string;
  display: string;
}

interface ProvidersResponse {
  results: Provider[];
}

interface ExtendedVisit extends Visit {
  attributes: Array<{
    uuid: string;
    display: string;
    attributeType: {
      uuid: string;
      display: string;
    };
    value: string;
  }>;
}
export interface SHAPackagesAndInterventionVisitAttribute {
  packages: Array<string>;
  interventions: Array<string>;
}

export function useVisit(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,patient,encounters:(uuid,diagnoses:(uuid,display,certainty,diagnosis:(coded:(uuid,display))),encounterDatetime,encounterType:(uuid,display),encounterProviders:(uuid,display,provider:(uuid,person:(uuid,display)))),location:(uuid,name,display),visitType:(uuid,name,display),startDatetime,stopDatetime,attributes)&limit=1';

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<ExtendedVisit> } }, Error>(
    `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    visits: data ? data?.data?.results[0] : null,
    error,
    isLoading,
    isValidating,
    mutateVisits: mutate,
  };
}

export const useProviders = () => {
  const customRepresentation = 'custom:(uuid,display)';
  const url = `/ws/rest/v1/provider?v=${customRepresentation}`;
  const { data, error, isLoading } = useSWRImmutable<{ data: ProvidersResponse }>(url, openmrsFetch);

  return { data, error, isLoading };
};

export const processClaims = (payload) => {
  const url = `/ws/rest/v1/insuranceclaims/claims`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const retryClaim = (claimUUID: string) => {
  const url = `/ws/rest/v1/insuranceclaims/claims/sendToExternal?claimUuid=${claimUUID}`;
  return openmrsFetch(url, {
    method: 'GET',
  });
};

export const useInterventions = () => {
  const interventions = useMemo(() => mockInterventions, []);
  return {
    isLoading: false,
    interventions: interventions,
    error: undefined,
  };
};

export const usePackages = () => {
  const _packages = useMemo(() => mockPackages, []);
  return {
    isLoading: false,
    packages: _packages,
    error: undefined,
  };
};

export const updateClaimStatus = (responseUUID: string) => {
  const url = `/ws/rest/v1/insuranceclaims/claim/update-status?externalId=${responseUUID}`;
  return openmrsFetch(url, {
    method: 'GET',
  });
};

export const ClaimsFormSchemaBase = z.object({
  claimExplanation: z.string(),
  claimJustification: z.string(),
  diagnoses: z.array(z.string()),
  visitType: z.string(),
  facility: z.string(),
  treatmentStart: z.string(),
  treatmentEnd: z.string(),
  packages: z.array(z.string()),
  interventions: z.array(z.string()),
  provider: z.string(),
});

export const ClaimsFormSchema = z.object({
  claimExplanation: z.string().min(1, { message: 'Claim explanation is required' }),
  claimJustification: z.string().min(1, { message: 'Claim justification is required' }),
  diagnoses: z.array(z.string()).min(1, { message: 'At least one diagnosis is required' }),
  visitType: z.string().min(1, { message: 'Visit type is required' }),
  facility: z.string().min(1, { message: 'Facility is required' }),
  treatmentStart: z.string().min(1, { message: 'Treatment start date is required' }),
  treatmentEnd: z.string().min(1, { message: 'Treatment end date is required' }),
  packages: z.array(z.string()).min(1, { message: 'At least one package is required' }),
  interventions: z.array(z.string()).min(1, { message: 'At least one intervention is required' }),
  provider: z.string().min(1, { message: 'Provider is required' }),
  supportingDocuments: z
    .object({
      name: z.string(),
      type: z.string(),
      size: z.number(),
      base64: z.string(),
      intervention: z.string(),
      purpose: z.enum([
        'CLAIM_FORM',
        'PREAUTH_FORM',
        'DISCHARGE_SUMMARY',
        'PRESCRIPTION',
        'LAB_ORDER',
        'INVOICE',
        'BIO_DETAILS',
        'IMAGING_ORDER',
        'OTHER',
        'FINAL_BILL',
        'LAB_RESULTS',
        'DEATH_NOTICE',
        'THEATRE_NOTES',
        'BIRTH_NOTIFICATION',
      ]),
      uploadedAt: z.date({ coerce: true }),
    })
    .array(),
});

export function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
