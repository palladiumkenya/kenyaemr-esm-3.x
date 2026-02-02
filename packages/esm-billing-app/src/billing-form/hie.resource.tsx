import { openmrsFetch, restBaseUrl, useConfig, usePatient } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../config-schema';

export interface EligibilityResponse {
  requestIdType: number;
  requestIdNumber: string;
  memberCrNumber: string;
  fullName: string;
  statusCode: string;
  statusDesc: string;
  schemes: Array<Scheme>;
}

export interface Scheme {
  schemeName: string;
  schemeId: number;
  memberType: 'PRIMARY' | 'BENEFICIARY';
  policy: {
    startDate: string;
    endDate: string;
    number: string;
  };
  coverage: {
    startDate: string;
    endDate: string;
    message: string;
    reason: string;
    possibleSolution: string | null;
    status: string;
  };
  principalContributor: {
    idNumber: string;
    idType: string;
    crNumber: string;
    name: string;
    relationship: string | null;
    employmentType: string;
    employerDetails: {
      name: string;
      jobGroup: string | null;
    };
  };
  beneficiaryOf: Array<Beneficiary>;
}

export interface Beneficiary {
  idNumber: string;
  idType: string;
  crNumber: string;
  name: string;
  relationship: string;
}

export const SCHEME_IDS = {
  UHC: 1,
  SHIF: 2,
  TSC: 3,
  POMSF: 4,
} as const;

export const SCHEME_NAMES = {
  1: 'UHC',
  2: 'SHIF',
  3: 'TSC',
  4: 'POMSF',
} as const;

export const useSHAEligibility = (patientUuid: string, shaIdentificationNumber?: fhir.Identifier[]) => {
  const { patient } = usePatient(patientUuid);
  const { nationalIdUUID } = useConfig<BillingConfig>();

  const nationalId = patient?.identifier
    ?.filter((identifier) => identifier)
    .filter((identifier) => identifier?.type?.coding?.some((coding) => coding?.code === nationalIdUUID))
    ?.at(0)?.value;

  const url =
    shaIdentificationNumber?.length > 0 && nationalId
      ? `${restBaseUrl}/insuranceclaims/CoverageEligibilityRequest?nationalId=${nationalId}`
      : undefined;

  const { data, error, isLoading, mutate } = useSWR<{ data: EligibilityResponse }>(url, openmrsFetch, {
    errorRetryCount: 0,
  });

  return {
    data: data?.data,
    isLoading,
    error,
    mutate,
  };
};
