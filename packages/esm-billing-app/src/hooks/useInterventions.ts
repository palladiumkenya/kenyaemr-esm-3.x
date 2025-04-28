import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import useFacilityLevel from './useFacilityLevel';

export type InterventionsFilter = {
  package_code?: string;
  scheme_code?: string;
  applicable_gender?: 'MALE' | 'FEMALE';
};

export interface Data {
  id: number;
  isMultisession: boolean;
  fund: string;
  supportedScheme: string;
  parentBenefitName: string;
  parentBenefitCode: string;
  benefitCode: string;
  benefitName: string;
  guid: string;
  created: string;
  updated: string;
  replicated: string;
  owner: number;
  needsPreauth: boolean;
  levelsApplicable: string[];
  paymentMechanism: string;
  coverageLevel: string;
  annualQuantityLimit: number;
  annualQuantityLimitChoice: string;
  annualQuantityLimitType: string;
  overallTariff: string;
  overallTariffHasLimit: boolean;
  annualLimitValue: string;
  usageFrequencyLimit: string;
  usageFrequencyType: string;
  status: string;
  needsManualPreauthApproval: boolean;
  needsDoctorAuthorization: boolean;
  numberOfDoctorsRequired: string;
  needsMemberAuthorization: boolean;
  accessPoint: string;
  name: string;
  code: string;
  active: boolean;
  activeForUhc: boolean;
  diagnosisBlock: string[];
  diagnosisList: string[];
  applicableGender: string;
  applicableFacilityOwnership: string;
  upperAgeLimit: string;
  lowerAgeLimit: string;
  investigationTariff: string;
  investigationTariffHasLimit: boolean;
  managementTariff: string;
  managementTariffHasLimit: boolean;
  isIntraMetro: boolean;
  tariffPerAdditionalKilometer: string;
  needApprovalBeforeClaimSubmission: boolean;
  needsProtocols: boolean;
  level_2_tariff: string;
  level_3_tariff: string;
  level_4_tariff: string;
  level_5_tariff: string;
  level_6_tariff: string;
  protocolUsed: string;
  tariffLimitPerIndividual: string;
  complexity: string;
  comment: string;
  retiredOn: string;
  requiresSurgicalPreauth: boolean;
  requiresRenalPreauth: boolean;
  requiresOncologyPreauth: boolean;
  requiresRadiologyPreauth: boolean;
  requiresOpticalPreauth: boolean;
  applicableSchemes: string[];
  benefit: number;
}

export const useInterventions = (filters: InterventionsFilter) => {
  const { error: facilityLevelError, isLoading: isLoadingFacilityLevel, level } = useFacilityLevel();
  const urlParams = new URLSearchParams({
    ...filters,
    synchronize: 'false',
  });
  const url = `${restBaseUrl}/kenyaemr/sha-interventions?${urlParams.toString()}`;
  const { isLoading, error, data } = useSWR<FetchResponse<{ results: Array<Data> }>>(url, openmrsFetch);
  const mapper = ({ benefitCode, benefitName, parentBenefitCode }: Data): any => ({
    interventionCode: benefitCode,
    interventionName: benefitName,
    interventionPackage: parentBenefitCode,
  });

  const interventions = useMemo(() => {
    const packageCodes = filters.package_code?.split(',') || [];
    return data?.data?.results
      ?.filter((d) => {
        // 1. Filter by package code (only if defined)
        if (packageCodes.length > 0 && !packageCodes.includes(d.parentBenefitCode)) {
          return false;
        }

        // 2. Filter by applicable gender (only if defined)
        if (
          filters.applicable_gender &&
          d.applicableGender &&
          !['ALL', filters.applicable_gender].includes(d.applicableGender)
        ) {
          return false;
        }

        if (level && d.levelsApplicable && !d.levelsApplicable.some((l) => level.includes(l))) {
          return false;
        }

        return true; // Keep item if it passes all filters
      })
      ?.map(mapper);
  }, [data, filters, level]); // Ensure proper memoization
  const allInterventions = useMemo(() => {
    return (data?.data?.results ?? []).map(mapper);
  }, [data]);

  return {
    isLoading: isLoading || isLoadingFacilityLevel,
    interventions: interventions ?? [],
    allInterventions,
    error: error || facilityLevelError,
  };
};
