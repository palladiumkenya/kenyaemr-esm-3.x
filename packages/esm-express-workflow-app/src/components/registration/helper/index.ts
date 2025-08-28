import { type EligibilityResponse } from '../type';

/**
 * Extracts relevant eligibility status from the EligibilityResponse.
 *
 * @param {EligibilityResponse} [eligibilityData] - The eligibility response data.
 * @returns {null | {
 *   isPHCEligible: boolean,
 *   isSHIFEligible: boolean,
 *   isECCIFEligible: boolean,
 *   isCivilServantEligible: boolean,
 *   coverageType: string,
 *   status: number,
 *   message: string,
 *   reason: string,
 * }}
 */
export const getEligibilityStatus = (eligibilityData?: EligibilityResponse) => {
  if (!eligibilityData) {
    return null;
  }

  return {
    isPHCEligible:
      eligibilityData.status === 1 ||
      eligibilityData.memberCrNumber?.startsWith('CR') ||
      eligibilityData.memberCrNumber?.startsWith('SHA'),
    isSHIFEligible: eligibilityData.status === 1,
    isECCIFEligible: eligibilityData.status === 1,
    isCivilServantEligible: eligibilityData.status === 1 && eligibilityData.coverageType === 'CIVIL_SERVANT',
    coverageType: eligibilityData.coverageType,
    status: eligibilityData.status,
    message: eligibilityData.message,
    reason: eligibilityData.reason,
  };
};

/**
 * Retrieves the National ID from a FHIR Patient resource.
 *
 * @param {fhir.Patient} patient - The patient resource.
 * @returns {string | null} The National ID, if found, or null.
 */
export const getNationalIdFromPatient = (patient: fhir.Patient): string | null => {
  const nationalIdIdentifier = patient.identifier?.find(
    (identifier) =>
      identifier.type?.coding?.[0]?.code === 'national-id' || identifier.type?.coding?.[0]?.display === 'National ID',
  );
  return nationalIdIdentifier?.value || null;
};
