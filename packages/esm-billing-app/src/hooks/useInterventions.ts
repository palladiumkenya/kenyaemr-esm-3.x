import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
import useFacilityLevel from './useFacilityLevel';
import { SHAIntervention } from '../types';

export type InterventionsFilter = {
  package_code?: string;
  scheme_code?: string;
  applicable_gender?: 'MALE' | 'FEMALE';
};

interface Intervention {
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

/**
 * Hook to fetch and filter interventions based on provided filters
 * @param filters Object containing filtering criteria
 * @returns Object with loading state, filtered interventions, all interventions, and any errors
 */
export const useInterventions = (filters: InterventionsFilter) => {
  const { error: facilityLevelError, isLoading: isLoadingFacilityLevel, level } = useFacilityLevel();

  // Build URL parameters for the API call
  const urlParams = new URLSearchParams({
    ...(filters || {}),
    synchronize: 'false',
  });

  const url = `${restBaseUrl}/kenyaemr/sha-interventions?${urlParams.toString()}`;
  const { isLoading, error, data } = useSWR<FetchResponse<{ results: Array<Intervention> }>>(url, openmrsFetch);

  // Mapper function to transform intervention data
  const mapper = ({ benefitCode, name, parentBenefitCode }: Intervention): SHAIntervention => ({
    interventionCode: benefitCode,
    interventionName: name,
    interventionPackage: parentBenefitCode,
    ...({} as any),
  });

  // Filter and map interventions
  const interventions = useMemo(() => {
    if (!data?.data?.results) {
      return [];
    }

    const packageCodes = filters.package_code?.split(',').filter(Boolean) || [];

    // Filter based on criteria
    const filteredResults = data.data.results.filter((intervention) => {
      // Filter by package code (only if defined)
      if (packageCodes.length > 0 && !packageCodes.includes(intervention.parentBenefitCode)) {
        return false;
      }

      // Filter by applicable gender (only if defined)
      if (
        filters.applicable_gender &&
        intervention.applicableGender &&
        !['ALL', filters.applicable_gender].includes(intervention.applicableGender)
      ) {
        return false;
      }

      // Filter by facility level
      if (level && intervention.levelsApplicable && !intervention.levelsApplicable.some((l) => level.includes(l))) {
        return false;
      }

      return true; // Keep item if it passes all filters
    });

    // Map to the required format and ensure uniqueness by interventionCode
    const mappedInterventions = filteredResults.map(mapper);

    // Remove duplicates based on interventionCode
    const uniqueInterventions = Array.from(
      new Map(mappedInterventions.map((item) => [item.interventionCode, item])),
    ).map(([, value]) => value);

    return uniqueInterventions;
  }, [data, filters, level]);

  // Map all interventions without filtering
  const allInterventions = useMemo(() => {
    if (!data?.data?.results) {
      return [];
    }

    // Map to the required format and ensure uniqueness
    const mappedInterventions = data.data.results.map(mapper);

    // Remove duplicates based on interventionCode
    const uniqueInterventions = Array.from(
      new Map(mappedInterventions.map((item) => [item.interventionCode, item])),
    ).map(([, value]) => value);

    return uniqueInterventions;
  }, [data]);

  return {
    isLoading: isLoading || isLoadingFacilityLevel,
    interventions: interventions as Array<SHAIntervention>,
    allInterventions: allInterventions as Array<SHAIntervention>,
    error: error || facilityLevelError,
  };
};
