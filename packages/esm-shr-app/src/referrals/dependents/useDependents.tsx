import useSWR from 'swr';
import trim from 'lodash/trim';
import { getSessionLocation, navigate, openmrsFetch, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';

export interface Dependent {
  name: string | undefined;
  relationship: string | undefined;
  phoneNumber: string | undefined;
  gender: string | undefined;
  dependentInfo: fhir.Patient;
}

interface FHIRResponse {
  data: {
    entry: Array<{
      resource: fhir.Patient;
    }>;
  };
}

interface DependentInfo {
  id: string;
  extension: Array<{
    url: string;
    valueIdentifier?: {
      use: string;
      type: {
        coding: Array<{
          system: string;
          code: string;
          display: string;
        }>;
      };
      value: string;
    };
    valueString?: string;
  }>;
  relationship: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  name: {
    text: string;
    family: string;
    given: string[];
  };
  address: {
    country: string;
  };
  gender: string;
}

interface DependentPayload {
  name: string;
  relationship: string;
  gender: string;
  dependentInfo: DependentInfo;
}

const useDependents = (
  identifierValue: string,
  identifierType: string = 'National ID',
): {
  dependents: Dependent[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
} => {
  const url = `${restBaseUrl}/kenyaemr/getSHAPatient/${identifierValue}/${identifierType}`;
  const { data, isLoading, error } = useSWR<FHIRResponse>(url, openmrsFetch);
  const fhirPatient = data?.data?.entry?.[0]?.resource;

  const dependents = fhirPatient?.contact?.map(
    (contact): Dependent => ({
      name: contact.name?.text ? trim(contact.name.text) : undefined,
      relationship: contact.relationship?.[0]?.coding?.[0]?.display,
      phoneNumber: contact.telecom?.[0]?.value,
      gender: contact.gender,
      dependentInfo: contact as fhir.Patient,
    }),
  );

  return {
    dependents,
    isLoading,
    error,
  };
};

export default useDependents;

export const createPatientAndLinkToPatientAsRelatedPerson = async (patientUuid: string, dependent: Dependent, t) => {
  await createDependentPatient(dependent as any, patientUuid, t);
};

export async function createDependentPatient(dependent: DependentPayload, patientUuid: string, t) {
  const { dependentInfo } = dependent;
  const locationUuid = (await getSessionLocation()).uuid;
  // Extract identifiers from extensions
  const identifiers = dependentInfo.extension
    .filter((ext) => ext.url === 'identifiers' && ext.valueIdentifier)
    .map((ext) => ({
      identifier: ext.valueIdentifier.value,
      identifierType: getIdentifierTypeUUID(ext.valueIdentifier.type.coding[0].code),
      location: locationUuid,
      preferred: ext.valueIdentifier.use === 'official',
    }));

  // Extract birth date from extensions
  const birthdate = dependentInfo.extension.find(
    (ext) => ext.url === 'https://ts.kenya-hie.health/fhir/StructureDefinition/date_of_birth',
  )?.valueString;

  // Create the payload structure
  const payload = {
    person: {
      names: [
        {
          preferred: true,
          givenName: dependentInfo.name.given[0],
          middleName: dependentInfo.name.given[1] || '',
          familyName: dependentInfo.name.family,
        },
      ],
      gender: dependentInfo.gender.charAt(0).toUpperCase(),
      birthdate: birthdate,
      birthdateEstimated: false,
      attributes: [],
      addresses: [
        {
          address1: '',
          cityVillage: '',
          country: '',
          postalCode: '',
          stateProvince: '',
        },
      ],
    },
    identifiers: identifiers
      .filter((identifier) => identifier.identifierType)
      .map((identifier) => ({
        identifier: identifier.identifier,
        identifierType: identifier.identifierType,
        location: identifier.location,
        preferred: false,
      })),
  };

  // Generate OpenMRS identifier
  const openmrsIdentifierSource = 'fb034aac-2353-4940-abe2-7bc94e7c1e71';
  const identifierValue = await generateIdentifier(openmrsIdentifierSource);
  const location = await getSessionLocation();

  const openmrsIdentifier = {
    identifier: identifierValue.data.identifier,
    identifierType: 'dfacd928-0370-4315-99d7-6ec1c9f7ae76', // OpenMRS ID UUID
    location: location.uuid,
    preferred: true,
  };

  payload.identifiers.push(openmrsIdentifier);
  // Create the patient
  try {
    const response = await openmrsFetch(`${restBaseUrl}/patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    const relationshipPayload = {
      personA: patientUuid,
      personB: response.data.uuid,
      relationshipType: dependent.relationship,
    };
    const relationshipResponse = await saveRelationship(relationshipPayload);
    showSnackbar({
      title: t('dependentRegisteredSuccessfully', 'Dependent registered successfully'),
      subtitle: t('dependentRegisteredSuccessfullySubtitle', 'Dependent registered successfully'),
      kind: 'success',
      isLowContrast: true,
    });

    navigate({ to: `\${openmrsSpaBase}/patient/${response.data.uuid}/chart` });
  } catch (error) {
    showSnackbar({
      title: t('dependentRegistrationFailed', 'Dependent registration failed'),
      subtitle: t('dependentRegistrationFailedSubtitle', 'Dependent registration failed'),
      kind: 'error',
      isLowContrast: true,
    });
  }
}

// Helper function to map identifier codes to OpenMRS UUIDs
function getIdentifierTypeUUID(code: string): string {
  const identifierTypeMap = {
    'sha-number': '24aedd37-b5be-4e08-8311-3721b8d5100d',
    'national-id': '49af6cdc-7968-4abb-bf46-de10d7f4859f',
    'passport-number': 'be9beef6-aacc-4e1f-ac4e-5babeaa1e303',
    'birth-certificate-number': '68449e5a-8829-44dd-bfef-c9c8cf2cb9b2',
  };

  return identifierTypeMap[code] || '';
}

// Reuse the existing generateIdentifier function
function generateIdentifier(source: string) {
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

export function saveRelationship(relationship) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/relationship`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: relationship,
    signal: abortController.signal,
  });
}
