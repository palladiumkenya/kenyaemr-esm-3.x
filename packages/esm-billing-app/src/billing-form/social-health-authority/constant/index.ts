/**
 * SHA Coverage Status Codes
 * These codes are returned by the Kenya Health Information Exchange (HIE)
 * to indicate the eligibility status of a patient's insurance coverage.
 */
export enum CoverageStatus {
  /**
   * Coverage is active and valid
   * Patient is eligible for services under this scheme
   */
  ACTIVE = '1',

  /**
   * Coverage is inactive or expired
   * Patient is not currently eligible for services
   */
  INACTIVE = '0',
}

/**
 * SHA Eligibility Status Codes
 * Status codes returned by the HIE eligibility verification endpoint
 */
export enum EligibilityStatusCode {
  /**
   * Member found in the system with valid registration
   * Check individual schemes for coverage details
   */
  MEMBER_FOUND = '10',

  /**
   * Member not found in the system
   * Patient may need to register or verify their details
   */
  MEMBER_NOT_FOUND = '11',

  /**
   * Validation error - invalid identifier provided
   */
  VALIDATION_ERROR = '12',
}

/**
 * SHA Member Types
 * Indicates the patient's relationship to the insurance policy
 */
export enum MemberType {
  /**
   * Primary policy holder
   * The person who is the main contributor/owner of the insurance policy
   */
  PRIMARY = 'PRIMARY',

  /**
   * Beneficiary/Dependent
   * A person covered under someone else's insurance policy (e.g., spouse, child)
   */
  BENEFICIARY = 'BENEFICIARY',
}

/**
 * SHA Scheme Names
 * Official insurance scheme names in the Kenyan health system
 */
export enum SchemeName {
  /**
   * Universal Health Coverage
   * Primary health care coverage for all Kenyan citizens
   */
  UHC = 'UHC',

  /**
   * Social Health Insurance Fund
   * Contributory health insurance scheme
   */
  SHIF = 'SHIF',

  /**
   * Teachers Service Commission Scheme
   * Health coverage for teachers and their dependents
   */
  TSC = 'TSC',

  /**
   * Police Officers Medical Scheme Fund
   * Health coverage for police officers and their families
   */
  POMSF = 'POMSF',
}
