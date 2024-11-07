import { openmrsFetch, restBaseUrl, useConfig, usePatient } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { BillingConfig } from '../config-schema';

type EligibilityResponse = { message: { eligible: 0 | 1; possible_solution: string; reason: string } };

type HIEEligibilityResponse = {
  insurer: string;
  inforce: boolean;
  start: string;
  eligibility_response: EligibilityResponse;
};

export const useHIEEligibility = (patientUuid: string) => {
  const { patient } = usePatient(patientUuid);
  const { nationalIdUUID } = useConfig<BillingConfig>();

  const nationalId = patient?.identifier
    ?.filter((identifier) => identifier)
    .filter((identifier) => identifier.type.coding.some((coding) => coding.code === nationalIdUUID))
    ?.at(0)?.value;

  const url = `${restBaseUrl}/insuranceclaims/CoverageEligibilityRequest?patientUuid=${patientUuid}&nationalId=${nationalId}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: Array<HIEEligibilityResponse> }>(url, openmrsFetch, {
    errorRetryCount: 0,
  });

  return {
    data:
      data?.data.map((d) => {
        return {
          ...d,
          eligibility_response: JSON.parse(d.eligibility_response as unknown as string) as EligibilityResponse,
        };
      }) ?? [],
    isLoading,
    error,
    mutate,
  };
};
