import { openmrsFetch, restBaseUrl, useConfig, usePatient } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../config-schema';

export interface EligibilityResponse {
  requestIdType: number;
  requestIdNumber: string;
  memberCrNumber: string;
  fullName: string;
  memberType: string;
  coverageStartDate: Date;
  coverageEndDate: Date;
  status: number;
  message: string;
  reason: string;
  possibleSolution: null;
  coverageType: string;
  primaryContributor: null;
  employerDetails: EmployerDetails;
  dependants: Array<unknown>;
  active: boolean;
}

export interface EmployerDetails {
  employerName: string;
  jobGroup: string;
  scheme: Scheme;
}

export interface Scheme {
  schemeCode: string;
  schemeName: string;
  schemeCategoryCode: string;
  schemeCategoryName: string;
  memberPolicyStartDate: string;
  memberPolicyEndDate: string;
  joinDate: string;
  leaveDate: string;
}

type HIEEligibilityResponse = {
  insurer: string;
  inforce: boolean;
  start: string;
  eligibility_response: EligibilityResponse;
};

export const useSHAEligibility = (patientUuid: string, shaIdentificationNumber?: fhir.Identifier[]) => {
  const { patient } = usePatient(patientUuid);
  const { nationalIdUUID } = useConfig<BillingConfig>();

  const nationalId = patient?.identifier
    ?.filter((identifier) => identifier)
    .filter((identifier) => identifier.type.coding.some((coding) => coding.code === nationalIdUUID))
    ?.at(0)?.value;

  const url =
    shaIdentificationNumber?.length > 0
      ? `${restBaseUrl}/insuranceclaims/CoverageEligibilityRequest?patientUuid=${patientUuid}&nationalId=${nationalId}`
      : undefined; // this is to avoid making the request if the patient does not have a SHA Id.
  const { data, error, isLoading, mutate } = useSWR<{ data: Array<HIEEligibilityResponse> }>(url, openmrsFetch, {
    errorRetryCount: 0,
  });

  return {
    data: data
      ? { ...(JSON.parse(data?.data.at(0)?.eligibility_response as unknown as string) as EligibilityResponse) }
      : undefined,
    isLoading,
    error,
    mutate,
  };
};
