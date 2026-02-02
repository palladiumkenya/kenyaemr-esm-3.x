import { formatDate } from '@openmrs/esm-framework';
import { isWithinInterval, parseISO } from 'date-fns';
import { CoverageStatus, MemberType } from '../constant';
import { Scheme } from '../../hie.resource';

/**
 * Checks if a scheme's coverage status is active
 * @param scheme - The scheme to check
 * @returns true if coverage status is ACTIVE ('1'), false otherwise
 */
export const isCoverageActive = (scheme: Scheme): boolean => {
  return scheme?.coverage?.status === CoverageStatus.ACTIVE;
};

/**
 * Checks if the current date is within the scheme's coverage period
 * @param scheme - The scheme to check
 * @returns true if current date is within coverage period, false otherwise
 */
export const isWithinCoveragePeriod = (scheme: Scheme): boolean => {
  if (!scheme?.coverage?.startDate || !scheme?.coverage?.endDate) {
    return false;
  }

  try {
    const now = new Date();
    const startDate = parseISO(scheme.coverage.startDate);
    const endDate = parseISO(scheme.coverage.endDate);
    return isWithinInterval(now, { start: startDate, end: endDate });
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a scheme is eligible and currently active
 * A scheme is considered active if:
 * 1. Coverage status is ACTIVE ('1')
 * 2. Current date falls within the coverage period (startDate to endDate)
 *
 * This is a pure function with no side effects
 *
 * @param scheme - The scheme to check
 * @returns true if scheme is eligible and active, false otherwise
 */
export const isSchemeEligibleAndActive = (scheme: Scheme): boolean => {
  if (!scheme?.coverage) {
    return false;
  }

  return isCoverageActive(scheme) && isWithinCoveragePeriod(scheme);
};

/**
 * Get eligibility for a specific scheme (checks both PRIMARY and BENEFICIARY)
 * Priority: PRIMARY member type takes precedence over BENEFICIARY
 *
 * @param schemes - Array of all schemes
 * @param schemeName - Name of the scheme to check
 * @returns Object containing eligibility status, member type, and scheme details
 */
export const getSchemeEligibility = (
  schemes: Array<Scheme>,
  schemeName: string,
): { eligible: boolean; memberType: string | null; scheme: Scheme | null } => {
  const schemeMatches = schemes.filter((s) => s.schemeName.toUpperCase() === schemeName.toUpperCase());

  if (schemeMatches.length === 0) {
    return { eligible: false, memberType: null, scheme: null };
  }

  const primaryScheme = schemeMatches.find((s) => s.memberType === MemberType.PRIMARY);
  if (primaryScheme && isSchemeEligibleAndActive(primaryScheme)) {
    return { eligible: true, memberType: MemberType.PRIMARY, scheme: primaryScheme };
  }

  const beneficiaryScheme = schemeMatches.find((s) => s.memberType === MemberType.BENEFICIARY);
  if (beneficiaryScheme && isSchemeEligibleAndActive(beneficiaryScheme)) {
    return { eligible: true, memberType: MemberType.BENEFICIARY, scheme: beneficiaryScheme };
  }

  return { eligible: false, memberType: null, scheme: schemeMatches[0] };
};

/**
 * Formats a date string using OpenMRS formatDate utility
 * @param dateString - ISO date string to format
 * @returns Formatted date string (e.g., "30 Sep 2034") or original string if parsing fails
 */
export const formatCoverageDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDate(date, { mode: 'wide', time: false });
  } catch (error) {
    return dateString;
  }
};
