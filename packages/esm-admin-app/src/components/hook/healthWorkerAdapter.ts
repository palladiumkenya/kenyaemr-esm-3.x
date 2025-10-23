import { FetchResponse, makeUrl, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { HWR_API_NO_CREDENTIALS, PROVIDER_NOT_FOUND, RESOURCE_NOT_FOUND, UNKNOWN } from '../../constants';
import { CustomHIEPractitionerResponse, PractitionerResponse } from '../../types';
import { useState } from 'react';

/**
 * Unified response type that can handle both FHIR and custom HIE formats
 */
export interface UnifiedHealthWorkerResponse {
  fhirFormat: boolean;
  data: PractitionerResponse | CustomHIEPractitionerResponse;
}

/**
 * Adapter to normalize health worker data based on response format
 */
export class HealthWorkerAdapter {
  /**
   * Extracts common practitioner information from either response format
   */
  static normalize(response: UnifiedHealthWorkerResponse): NormalizedPractitioner {
    if (response.fhirFormat) {
      return this.normalizeFHIRResponse(response.data as PractitionerResponse);
    } else {
      return this.normalizeCustomResponse(response.data as CustomHIEPractitionerResponse);
    }
  }

  private static normalizeFHIRResponse(data: PractitionerResponse): NormalizedPractitioner {
    const resource = data.entry?.[0]?.resource;
    if (!resource) {
      throw new Error('Invalid FHIR response: No resource found');
    }

    const name = resource.name?.[0];
    const identifierByType = (code: string) =>
      resource.identifier?.find((id) => id.type?.coding?.[0]?.code === code)?.value;

    const primaryQualification = resource.qualification?.[0];
    const licenseExtension = primaryQualification?.extension?.find(
      (ext) => ext.url.includes('license') || ext.url.includes('registration'),
    );

    return {
      id: resource.id,
      fullName: name?.text || '',
      firstName: name?.text?.split(' ')[0] || '',
      middleName: name?.text?.split(' ')[1] || '',
      lastName: name?.text?.split(' ')[2] || name?.text?.split(' ')[1] || '',
      gender: resource.gender || '',
      registrationId: identifierByType('registration') || '',
      externalReferenceId: identifierByType('license') || '',
      nationalId: identifierByType('national_id') || '',
      passportNumber: identifierByType('passport') || '',
      licenseNumber: identifierByType('license') || '',
      licensingBody: licenseExtension?.valueCoding?.display || '',
      specialty: primaryQualification?.code?.coding?.[0]?.display || '',
      qualification: primaryQualification?.code?.coding?.[0]?.display || '',
      phoneNumber: resource.telecom?.find((t) => t.system === 'phone')?.value || '',
      email: resource.telecom?.find((t) => t.system === 'email')?.value || '',
      licenseStartDate: primaryQualification?.period?.start || '',
      licenseEndDate: primaryQualification?.period?.end || '',
      isActive: resource.active,
      providerUniqueIdentifier: resource.id,
      status: resource.active ? 'active' : 'inactive',
    };
  }

  private static normalizeCustomResponse(data: CustomHIEPractitionerResponse): NormalizedPractitioner {
    const { membership, licenses, contacts, identifiers, professional_details } = data.message;

    const mostRecentLicense = licenses
      ?.filter((l) => l.license_end)
      .sort((a, b) => new Date(b.license_end).getTime() - new Date(a.license_end).getTime())[0];

    return {
      id: membership.id,
      fullName: membership.full_name,
      firstName: membership.first_name,
      middleName: membership.middle_name,
      lastName: membership.last_name,
      gender: membership.gender,
      registrationId: membership.registration_id,
      externalReferenceId: membership.external_reference_id,
      nationalId: identifiers.identification_number,
      passportNumber: '',
      licenseNumber: membership.external_reference_id,
      licensingBody: membership.licensing_body,
      specialty: membership.specialty || professional_details?.specialty,
      qualification: professional_details?.educational_qualifications || membership.specialty,
      phoneNumber: contacts.phone,
      email: contacts.email,
      licenseStartDate: mostRecentLicense?.license_start || '',
      licenseEndDate: mostRecentLicense?.license_end || '',
      isActive: membership.is_active === 1,
      providerUniqueIdentifier: membership.id,
      status: membership.status,
      professionalCadre: professional_details?.professional_cadre,
      practiceType: professional_details?.practice_type,
      licenses: licenses,
    };
  }

  /**
   * Type guard to check if response is FHIR format
   */
  static isFHIRFormat(response: any): response is PractitionerResponse {
    return response.resourceType === 'Bundle' || (response.entry && Array.isArray(response.entry));
  }
}

/**
 * Normalized practitioner data structure
 */
export interface NormalizedPractitioner {
  id: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  registrationId: string;
  externalReferenceId: string;
  nationalId: string;
  passportNumber: string;
  licenseNumber: string;
  licensingBody: string;
  specialty: string;
  qualification: string;
  phoneNumber: string;
  email: string;
  licenseStartDate: string;
  licenseEndDate: string;
  isActive: boolean;
  providerUniqueIdentifier: string;
  status: string;
  professionalCadre?: string;
  practiceType?: string;
  licenses?: Array<{
    id: string;
    external_reference_id: string;
    license_type: string;
    license_start: string;
    license_end: string;
  }>;
}

/**
 * Search for health care worker with automatic format detection
 */
export const searchHealthCareWork = async (
  identifierType: string,
  identifierNumber: string,
  regulator: string,
): Promise<UnifiedHealthWorkerResponse> => {
  const url = `${restBaseUrl}/kenyaemr/practitionersearch?identifierType=${identifierType}&identifierNumber=${identifierNumber}&regulator=${regulator}`;

  const response = await fetch(makeUrl(url));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(HWR_API_NO_CREDENTIALS);
    } else if (response.status === 404) {
      throw new Error(RESOURCE_NOT_FOUND);
    }
    throw new Error(UNKNOWN);
  }

  const responseData = await response.json();

  // Check for error in response
  if (responseData?.issue) {
    throw new Error(PROVIDER_NOT_FOUND);
  }

  // Determine format based on fhirFormat flag or structure
  const isFhir = responseData.fhirFormat === true || HealthWorkerAdapter.isFHIRFormat(responseData);

  return {
    fhirFormat: isFhir,
    data: responseData,
  };
};

/**
 * Hook for searching health care worker with normalized data
 */
export const useHealthWorkerSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (
    identifierType: string,
    identifierNumber: string,
    regulator: string,
  ): Promise<NormalizedPractitioner | null> => {
    try {
      setIsSearching(true);
      setError(null);

      const response = await searchHealthCareWork(identifierType, identifierNumber, regulator);
      return HealthWorkerAdapter.normalize(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : UNKNOWN;
      setError(errorMessage);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return { search, isSearching, error };
};
