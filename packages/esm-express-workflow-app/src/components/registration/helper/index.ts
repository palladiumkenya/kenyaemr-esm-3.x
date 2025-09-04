import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import {
  type HIEBundleResponse,
  type EligibilityResponse,
  HIEContact,
  InputDependent,
  DependentPayload,
  HIEPatient,
} from '../type';
import { birthCertificateUuid, nationalIdUuid, passportUuid, shaNumberUuid } from '../constant';

/**
 * Extracts eligibility data from the EligibilityResponse structure.
 * Since the EligibilityResponse is already a direct object, no parsing is needed.
 *
 * @param {EligibilityResponse} [eligibilityData] - The eligibility response data object.
 * @returns {null | EligibilityResponse} The eligibility data or null if not available.
 */
export const parseEligibilityResponse = (eligibilityData?: EligibilityResponse) => {
  if (!eligibilityData) {
    return null;
  }

  return eligibilityData;
};

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
  const parsedData = parseEligibilityResponse(eligibilityData);

  if (!parsedData) {
    return null;
  }

  return {
    isPHCEligible:
      parsedData.status === 1 ||
      parsedData.memberCrNumber?.startsWith('CR') ||
      parsedData.memberCrNumber?.startsWith('SHA'),
    isSHIFEligible: parsedData.status === 1,
    isECCIFEligible: parsedData.status === 1,
    isCivilServantEligible: parsedData.status === 1 && parsedData.coverageType === 'CIVIL_SERVANT',
    coverageType: parsedData.coverageType,
    status: parsedData.status,
    message: parsedData.message,
    reason: parsedData.reason,
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

/**
 * Returns the total number of patients pulled from the HIE from the given bundle.
 *
 * @param {Array<HIEBundleResponse> | null} hieResults - The HIE bundle response, or null if there is no data.
 * @returns {number} The total number of patients pulled from the HIE.
 */
export const getPulledPatientCount = (hieResults: Array<HIEBundleResponse> | null): number => {
  if (!hieResults || !Array.isArray(hieResults)) return 0;
  return hieResults.reduce((total, bundle) => total + (bundle?.total || 0), 0);
};

/**
 * Masks a full name by leaving the first two characters of each part
 * unmasked, and replacing the rest with asterisks.
 *
 * @param {string} fullName - The full name to mask.
 * @returns {string} The masked full name.
 */
export function maskName(fullName) {
  const maskedParts = fullName
    .trim()
    .split(' ')
    .map((part) => {
      if (part.length <= 2) return part;

      const firstTwo = part.slice(0, 2);
      const maskLength = part.length - 2;
      return firstTwo + '*'.repeat(maskLength);
    });

  return maskedParts.join(' ');
}

/**
 * Given a FHIR Patient resource, extract the list of dependents (contacts)
 * and transform them into a structured object with the following properties:
 * - id: a unique identifier for the dependent (either the contact's id, or if
 *   not present, a generated identifier like 'contact-<index>')
 * - name: the dependent's name, or 'Unknown' if not present
 * - relationship: the dependent's relationship to the patient, or 'Unknown' if
 *   not present
 * - phoneNumber: the dependent's phone number, or 'N/A' if not present
 * - email: the dependent's email address, or 'N/A' if not present
 * - gender: the dependent's gender, or 'Unknown' if not present
 * - birthDate: the dependent's date of birth, or 'Unknown' if not present
 * - shaNumber: the dependent's SHA number, or undefined if not present
 * - nationalId: the dependent's national ID, or undefined if not present
 * - birthCertificate: the dependent's birth certificate number, or undefined
 *   if not present
 * - contactData: the original contact resource for the dependent
 *
 * @param {fhir.Patient} patient - The patient resource with contacts.
 * @returns {Array<{[key: string]: string | undefined}>} The list of dependents.
 */
export const extractDependentsFromContacts = (patient: fhir.Patient) => {
  if (!patient?.contact) return [];

  return patient.contact.map((contact, index) => {
    const relationship = contact.relationship?.[0]?.coding?.[0]?.display || 'Unknown';

    const name =
      contact.name?.text?.trim() ||
      `${contact.name?.given?.join(' ') || ''} ${contact.name?.family || ''}`.trim() ||
      'Unknown';

    const phoneContact = contact.telecom?.find((t) => t.system === 'phone');
    const phoneNumber = phoneContact?.value || 'N/A';

    const emailContact = contact.telecom?.find((t) => t.system === 'email');
    const email = emailContact?.value || 'N/A';

    const gender = contact.gender || 'Unknown';

    const birthDateExtension = contact.extension?.find(
      (ext) => ext.url === 'https://ts.kenya-hie.health/fhir/StructureDefinition/date_of_birth',
    );
    const birthDate = birthDateExtension?.valueString || 'Unknown';

    const identifierExtensions = contact.extension?.filter((ext) => ext.url === 'identifiers') || [];
    const shaNumber = identifierExtensions.find((ext) => ext.valueIdentifier?.type?.coding?.[0]?.code === 'sha-number')
      ?.valueIdentifier?.value;

    const nationalId = identifierExtensions.find(
      (ext) => ext.valueIdentifier?.type?.coding?.[0]?.code === 'national-id',
    )?.valueIdentifier?.value;

    const birthCertificate = identifierExtensions.find(
      (ext) => ext.valueIdentifier?.type?.coding?.[0]?.code === 'birth-certificate',
    )?.valueIdentifier?.value;

    return {
      id: contact.id || `contact-${index}`,
      name,
      relationship,
      phoneNumber,
      email,
      gender,
      birthDate,
      shaNumber,
      nationalId,
      birthCertificate,
      contactData: contact,
    };
  });
};

export const transformToDependentPayload = (dependent: InputDependent, parentId?: string): DependentPayload => {
  const extensions: HIEContact['extension'] = [];

  if (dependent.nationalId) {
    extensions.push({
      url: 'identifiers',
      valueIdentifier: {
        use: 'official',
        type: {
          coding: [
            {
              system: 'https://ts.kenya-hie.health/Codesystem/identifier-types',
              code: 'national-id',
              display: 'National ID',
            },
          ],
        },
        value: dependent.nationalId,
      },
    });
  }

  if (dependent.birthCertificate) {
    extensions.push({
      url: 'identifiers',
      valueIdentifier: {
        use: 'official',
        type: {
          coding: [
            {
              system: 'https://ts.kenya-hie.health/Codesystem/identifier-types',
              code: 'birth-certificate',
              display: 'Birth Certificate',
            },
          ],
        },
        value: dependent.birthCertificate,
      },
    });
  }

  if (dependent.shaNumber) {
    extensions.push({
      url: 'identifiers',
      valueIdentifier: {
        use: 'official',
        type: {
          coding: [
            {
              system: 'https://ts.kenya-hie.health/Codesystem/identifier-types',
              code: 'sha-number',
              display: 'SHA Number',
            },
          ],
        },
        value: dependent.shaNumber,
      },
    });
  }

  if (dependent.householdNumber) {
    extensions.push({
      url: 'identifiers',
      valueIdentifier: {
        use: 'official',
        type: {
          coding: [
            {
              system: 'https://ts.kenya-hie.health/Codesystem/identifier-types',
              code: 'household-number',
              display: 'Household Number',
            },
          ],
        },
        value: dependent.householdNumber,
      },
    });
  }

  if (dependent.birthDate && dependent.birthDate !== 'Unknown') {
    extensions.push({
      url: 'https://ts.kenya-hie.health/fhir/StructureDefinition/date_of_birth',
      valueString: dependent.birthDate,
    });
  }

  extensions.push({
    url: 'https://ts.kenya-hie.health/fhir/StructureDefinition/person_with_disability',
    valueString: '0',
  });

  extensions.push({
    url: 'https://ts.kenya-hie.health/fhir/StructureDefinition/citizenship',
    valueString: 'kenyan',
  });

  const nameParts = dependent.name.trim().split(' ');
  const givenNames = nameParts.slice(0, -1);
  const familyName = nameParts[nameParts.length - 1];

  const name: HIEContact['name'] = {
    text: dependent.name,
    family: dependent.contactData?.name?.family || familyName || '',
    given: dependent.contactData?.name?.given || (givenNames.length > 0 ? givenNames : [dependent.name.split(' ')[0]]),
  };

  const telecom: HIEContact['telecom'] = [];
  if (dependent.email) {
    telecom.push({
      system: 'email',
      value: dependent.email,
    });
  }
  if (dependent.phoneNumber) {
    telecom.push({
      system: 'phone',
      value: dependent.phoneNumber,
    });
  }

  const addressExtensions: HIEContact['address']['extension'] = [];

  if (dependent.county) {
    addressExtensions.push({
      url: 'https://ts.kenya-hie.health/fhir/StructureDefinition/patients-county',
      valueString: dependent.county,
    });
  }

  if (dependent.subCounty) {
    addressExtensions.push({
      url: 'https://ts.kenya-hie.health/fhir/StructureDefinition/patients-sub-county',
      valueString: dependent.subCounty,
    });
  }

  if (dependent.ward) {
    addressExtensions.push({
      url: 'https://ts.kenya-hie.health/fhir/StructureDefinition/patients-ward',
      valueString: dependent.ward,
    });
  }

  if (dependent.village) {
    addressExtensions.push({
      url: 'https://ts.kenya-hie.health/fhir/StructureDefinition/patients-village_estate',
      valueString: dependent.village,
    });
  }

  const address: HIEContact['address'] = {
    extension: addressExtensions.length > 0 ? addressExtensions : undefined,
    city: dependent.county || 'NAIROBI',
    country: 'Kenya',
  };

  const relationship: HIEContact['relationship'] = [
    {
      coding: [
        {
          system: 'https://ts.kenya-hie.health/Codesystem/relationship-types',
          code: dependent.relationship.toLowerCase(),
          display: dependent.relationship,
        },
      ],
    },
  ];

  const dependentInfo: HIEContact = {
    id: dependent.id,
    extension: extensions.length > 0 ? extensions : undefined,
    relationship: relationship,
    name: name,
    telecom: telecom.length > 0 ? telecom : undefined,
    address: address,
    gender: dependent.gender.toLowerCase(),
  };

  return {
    name: dependent.name,
    relationship: dependent.relationship,
    gender: dependent.gender,
    dependentInfo,
  };
};

/**
 * Extracts all dependent contacts from a given HIE bundle.
 *
 * @param {HIEBundleResponse} bundle - HIE bundle to extract dependent contacts from
 * @returns {HIEContact[]} list of dependent contacts in the bundle, or an empty array if none found
 */
const extractDependentsFromHIEBundle = (bundle: HIEBundleResponse): HIEContact[] => {
  if (!bundle.entry || bundle.entry.length === 0) {
    return [];
  }

  const patient = bundle.entry[0].resource;
  return patient.contact || [];
};

/**
 * Finds a dependent contact in the given HIE bundle by the given dependent ID.
 *
 * @param {HIEBundleResponse} bundle - HIE bundle to search for dependent contact
 * @param {string} dependentId - ID of the dependent contact to find
 * @returns {HIEContact | undefined} dependent contact matching the given ID, or undefined if not found
 */
export const findDependentById = (bundle: HIEBundleResponse, dependentId: string): HIEContact | undefined => {
  const dependents = extractDependentsFromHIEBundle(bundle);
  return dependents.find((dependent) => dependent.id === dependentId);
};

/**
 * Returns the first patient resource in the given HIE bundle.
 *
 * @param {HIEBundleResponse} bundle - HIE bundle to extract patient from
 * @returns {HIEPatient | undefined} first patient resource in the bundle, or undefined if none found
 */
export const getPatientFromHIEBundle = (bundle: HIEBundleResponse): HIEPatient | undefined => {
  if (!bundle.entry || bundle.entry.length === 0) {
    return undefined;
  }

  return bundle.entry[0].resource;
};

/**
 * Finds and returns the value of the first identifier with the given identifier type.
 *
 * @param {HIEPatient['identifier']} identifiers - Array of identifiers to search
 * @param {string} identifierType - Identifier type to search for
 * @returns {string | undefined} value of the matched identifier, or undefined if none found
 */
export const getIdentifierValue = (
  identifiers: HIEPatient['identifier'],
  identifierType: string,
): string | undefined => {
  const identifier = identifiers.find((id) => id.type.coding.some((coding) => coding.code === identifierType));
  return identifier?.value;
};

/**
 * Finds and returns the value of an extension with the given URL
 *
 * @param {HIEContact['extension'] | HIEPatient['extension']} extensions - Extensions to search
 * @param {string} url - URL of the extension to find
 * @returns {string | undefined} valueString of the matched extension, or undefined if none found
 */
export const getExtensionValue = (
  extensions: HIEContact['extension'] | HIEPatient['extension'],
  url: string,
): string | undefined => {
  const extension = extensions?.find((ext) => ext.url === url);
  return extension?.valueString;
};

/**
 * Generates a new identifier for the given identifier source.
 *
 * @param {string} source - Identifier source to generate identifier for
 * @returns {Promise<FetchResponse>} Promise that resolves with the generated identifier, or rejects with an error
 */
export function generateIdentifier(source: string) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/idgen/identifiersource/${source}/identifier`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {},
    signal: abortController.signal,
  });
}

/**
 * Returns the UUID for the given identifier type code.
 *
 * @param {string} code - Identifier type code to get the UUID for
 * @returns {string} UUID for the given identifier type, or an empty string if not found
 */
export function getIdentifierTypeUUID(code: string): string {
  const identifierTypeMap = {
    'sha-number': shaNumberUuid,
    'national-id': nationalIdUuid,
    'passport-number': passportUuid,
    'birth-certificate-number': birthCertificateUuid,
  };

  return identifierTypeMap[code] || '';
}

/**
 * Checks if the given patient has dependents.
 *
 * @param {fhir.Patient} patient - The patient to check
 * @returns {boolean} true if the patient has dependents, false otherwise
 */
export const hasDependents = (patient: fhir.Patient): boolean => {
  return patient?.contact && Array.isArray(patient.contact) && patient.contact.length > 0;
};

/**
 * Converts a local patient object to a FHIR Patient resource.
 *
 * @param {Object} localPatient - The local patient object to convert
 * @returns {fhir.Patient} The equivalent FHIR Patient resource
 */
export const convertLocalPatientToFHIR = (localPatient: any): fhir.Patient => {
  return {
    resourceType: 'Patient',
    id: localPatient.uuid,
    identifier:
      localPatient.identifiers?.map((id: any) => ({
        value: id.identifier,
        type: {
          coding: [
            {
              display: id.identifierType?.display || '',
              code: id.identifierType?.uuid || '',
            },
          ],
        },
      })) || [],
    name: [
      {
        text: localPatient.person?.personName?.display || '',
        given: localPatient.person?.personName?.givenName ? [localPatient.person.personName.givenName] : [],
        family: localPatient.person?.personName?.familyName || '',
      },
    ],
    gender: localPatient.person?.gender?.toLowerCase() as 'male' | 'female' | 'other' | 'unknown',
    birthDate: localPatient.person?.birthdate ? localPatient.person.birthdate.split('T')[0] : undefined,
  };
};

/**
 * Checks if the given patient has an identifier with type 'sha-number' or 'SHA Number'
 * or if the identifier value starts with 'CR' or 'SHA'.
 *
 * @param {fhir.Patient} patient - The patient to check
 * @returns {boolean} true if the patient has a CR or SHA number, false otherwise
 */
export const hasCROrSHANumber = (patient: fhir.Patient): boolean => {
  return (
    patient.identifier?.some(
      (identifier) =>
        identifier.type?.coding?.[0]?.code === 'sha-number' ||
        identifier.type?.coding?.[0]?.display === 'SHA Number' ||
        identifier.value?.startsWith('CR') ||
        identifier.value?.startsWith('SHA'),
    ) || false
  );
};

/**
 * Returns an array of tags indicating the patient's eligibility status for various insurance schemes.
 * Now includes coverage type and reason information when available.
 *
 * The tags are in the format of { text: string, type: 'red' | 'green' | 'blue' | 'purple' | 'teal' }.
 *
 * The following tags can be returned:
 * - 'Eligible for PHC': green (patient is eligible for PHC)
 * - 'Not eligible for PHC': red (patient is not eligible for PHC)
 * - 'Eligible for SHIF': blue (patient is eligible for SHIF)
 * - 'Eligible for ECCIF': blue (patient is eligible for ECCIF)
 * - 'Eligible for Civil Servants Scheme': purple (patient is eligible for the Civil Servants Scheme)
 * - Coverage type tag: teal (shows the coverage type)
 * - Reason tag: red (shows the reason for ineligibility, if present)
 *
 * @param {fhir.Patient} patient - The patient to check eligibility status for
 * @param {EligibilityResponse} [eligibilityData] - The eligibility response data from the HIE API
 * @returns {Array<{ text: string; type: 'red' | 'green' | 'blue' | 'purple' | 'teal' }>}
 */
export const getEligibilityTags = (patient: fhir.Patient, eligibilityData?: EligibilityResponse) => {
  const tags: Array<{ text: string; type: 'red' | 'green' | 'blue' | 'purple' | 'teal' }> = [];

  const hasValidCRSHA = hasCROrSHANumber(patient);
  const parsedEligibilityData = parseEligibilityResponse(eligibilityData);

  if (hasValidCRSHA) {
    tags.push({ text: 'Eligible for PHC', type: 'green' });
  }

  if (parsedEligibilityData) {
    const { status, coverageType, reason } = parsedEligibilityData;

    if (coverageType) {
      const formatCoverageType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      };
      tags.push({
        text: `Coverage: ${formatCoverageType(coverageType)}`,
        type: 'teal',
      });
    }

    if (status === 1) {
      if (!hasValidCRSHA) {
        tags.push({ text: 'Eligible for PHC', type: 'green' });
      }
      tags.push({ text: 'Eligible for SHIF', type: 'blue' });
      tags.push({ text: 'Eligible for ECCIF', type: 'blue' });

      if (coverageType === 'CIVIL_SERVANT') {
        tags.push({ text: 'Eligible for Civil Servants Scheme', type: 'purple' });
      }
    } else {
      if (!hasValidCRSHA) {
        tags.push({ text: 'Not eligible for PHC', type: 'red' });
      }

      if (reason && reason.trim()) {
        tags.push({
          text: `${reason}`,
          type: 'red',
        });
      }
    }
  } else if (!hasValidCRSHA) {
    tags.push({ text: 'Not eligible for PHC', type: 'red' });
  }

  return tags;
};
