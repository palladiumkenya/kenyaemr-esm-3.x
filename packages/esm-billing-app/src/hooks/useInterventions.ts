import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { SHAIntervention } from '../types';

export const useInterventions = (code: string) => {
  const fetcher = (url: string) => {
    return openmrsFetch(url, {
      method: 'POST',
      body: {
        searchKeyAndValues: {
          // scheme_code: 'UHC',
          package_code: code,
        },
      },
    });
  };
  const url = `${restBaseUrl}/insuranceclaims/claims/interventions/query?code=${code}`;
  const { isLoading, error, data } = useSWR<
    FetchResponse<{
      status: string;
      data: Array<{
        interventionName: string;
        interventionCode: string;
        interventionPackage: string;
        interventionSubPackage: string;
        interventionDescription?: string;
      }>;
    }>
  >(url, fetcher);
  return {
    isLoading,
    interventions: (data?.data?.data ?? []).map(
      ({ interventionCode, interventionName, interventionPackage, interventionSubPackage, interventionDescription }) =>
        ({
          interventionCode,
          subCategoryBenefitsPackage: interventionSubPackage,
          interventionName,
        } as SHAIntervention),
    ),
    error,
  };
};
