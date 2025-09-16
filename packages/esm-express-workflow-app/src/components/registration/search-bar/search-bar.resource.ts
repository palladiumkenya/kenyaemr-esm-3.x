import { useMemo } from 'react';
import { FetchResponse, launchWorkspace, makeUrl, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type EligibilityResponse, type HIEEligibilityResponse, type LocalPatientApiResponse } from '../type';
import {
  HIE_CONFIGURATION_MISSING,
  PATIENT_API_NO_CREDENTIALS,
  PATIENT_NOT_FOUND,
  RESOURCE_NOT_FOUND,
  UNKNOWN,
} from '../constant';
import { createDependentPatient, createHIEPatient } from '../dependants/dependants.resource';
import { transformToDependentPayload } from '../helper';

export const searchPatientFromHIE = async (identifierType: string, searchQuery: string) => {
  const url = `${restBaseUrl}/kenyaemr/getSHAPatient/${searchQuery}/${identifierType}`;
  const response = await fetch(makeUrl(url));
  if (response.ok) {
    const responseData = await response.json();
    if (responseData?.issue) {
      throw new Error(PATIENT_NOT_FOUND);
    }
    return responseData;
  }
  if (response.status === 401) {
    throw new Error(PATIENT_API_NO_CREDENTIALS);
  } else if (response.status === 404) {
    throw new Error(RESOURCE_NOT_FOUND);
  } else if (response.status === 500) {
    throw new Error(HIE_CONFIGURATION_MISSING);
  }
  throw new Error(UNKNOWN);
};

export const usePatient = (searchQuery: string) => {
  const customRepresentation =
    'custom:(patientId,uuid,identifiers,display,patientIdentifier:(uuid,identifier),person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),attributes:(value,attributeType:(uuid,display)))';
  const url = `${restBaseUrl}/patient?q=${searchQuery}&v=${customRepresentation}`;

  const { isLoading, error, data } = useSWR<FetchResponse<LocalPatientApiResponse>>(
    searchQuery ? url : null,
    openmrsFetch,
  );

  const patient = data?.data?.results || null;

  return { patient, isLoading, error };
};

export const useSHAEligibility = (nationalId: string) => {
  const url =
    nationalId && nationalId.trim().length > 0
      ? `${restBaseUrl}/insuranceclaims/CoverageEligibilityRequest?nationalId=${nationalId}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<{ data: Array<HIEEligibilityResponse> }>(url, openmrsFetch);

  const processedData = useMemo(() => {
    if (!data?.data?.length) {
      return undefined;
    }

    const eligibilityResponse = data.data[0]?.eligibility_response;

    if (typeof eligibilityResponse === 'string') {
      try {
        return JSON.parse(eligibilityResponse) as EligibilityResponse;
      } catch (e) {
        return undefined;
      }
    }

    return eligibilityResponse as EligibilityResponse;
  }, [data]);

  return {
    data: processedData,
    isLoading,
    error,
    mutate,
  };
};

export const extractPatientIdentifiers = (patient: any, isDependent = false) => {
  const identifiers = [];

  if (isDependent) {
    const identifierExtensions = patient.extension?.filter((ext: any) => ext.url === 'identifiers') || [];

    identifierExtensions.forEach((ext: any) => {
      if (ext.valueIdentifier?.value && ext.valueIdentifier?.type?.coding?.[0]?.code) {
        identifiers.push({
          value: ext.valueIdentifier.value,
          type: ext.valueIdentifier.type.coding[0].code,
        });
      }
    });
  } else {
    if (patient.identifier && Array.isArray(patient.identifier)) {
      patient.identifier.forEach((id: any) => {
        if (id.value && id.type?.coding?.[0]?.code) {
          identifiers.push({
            value: id.value,
            type: id.type.coding[0].code,
          });
        }
      });
    }
  }

  return identifiers;
};

export const findExistingLocalPatient = async (patient: any, isDependent = false) => {
  const identifiers = extractPatientIdentifiers(patient, isDependent);

  if (identifiers.length === 0) {
    return null;
  }

  const prioritizedIdentifiers = identifiers.sort((a, b) => {
    const priorityOrder = { 'national-id': 1, 'sha-number': 2, 'birth-certificate': 3 };
    return (priorityOrder[a.type] || 999) - (priorityOrder[b.type] || 999);
  });

  for (const identifier of prioritizedIdentifiers) {
    try {
      const existingPatient = await searchLocalPatientByIdentifier(identifier.value, identifier.type);
      if (existingPatient) {
        return existingPatient;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
};

/**
 * Registers a new patient if they don't exist locally, or launches the start visit workspace if they do.
 *
 * @param {Object} hiePatient - The patient object returned from the HIE
 * @param {Object} t - The i18n translation function
 * @returns {Promise<Object>} The patient record for the newly registered or existing patient
 */
export const registerOrLaunchHIEPatient = async (hiePatient: any, t: any) => {
  try {
    const existingLocalPatient = await findExistingLocalPatient(hiePatient, false);

    if (existingLocalPatient) {
      const patientName =
        existingLocalPatient.person?.personName?.display ||
        `${existingLocalPatient.person?.personName?.givenName || ''} ${
          existingLocalPatient.person?.personName?.middleName || ''
        } ${existingLocalPatient.person?.personName?.familyName || ''}`.trim() ||
        hiePatient.name?.[0]?.text ||
        'Unknown Patient';

      return existingLocalPatient;
    } else {
      return await createHIEPatient(hiePatient, t);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Registers a new dependent patient if they don't exist locally, or launches the start visit workspace if they do.
 *
 * @param {Object} dependent - The dependent object returned from the HIE
 * @param {Object} t - The i18n translation function
 * @returns {Promise<Object>} The patient record for the newly registered or existing patient
 */
export const registerOrLaunchDependent = async (dependent: any, t: any) => {
  try {
    const existingLocalPatient = await findExistingLocalPatient(dependent.contactData, true);

    if (existingLocalPatient) {
      const patientName =
        existingLocalPatient.person?.personName?.display ||
        `${existingLocalPatient.person?.personName?.givenName || ''} ${
          existingLocalPatient.person?.personName?.middleName || ''
        } ${existingLocalPatient.person?.personName?.familyName || ''}`.trim() ||
        dependent.name;

      launchWorkspace('start-visit-workspace-form', {
        patientUuid: existingLocalPatient.uuid,
        workspaceTitle: t('startVisitWorkspaceTitle', 'Start Visit for {{patientName}}', {
          patientName: patientName,
        }),
      });

      return existingLocalPatient;
    } else {
      const dependentPayload = transformToDependentPayload(dependent);
      return await createDependentPatient(dependentPayload, t);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Searches for multiple dependents locally.
 *
 * @param {Object[]} dependents - Array of dependent objects returned from the HIE
 * @returns {Promise<Map<string, any>>} A Map of dependent IDs to the corresponding patient records if found, or `null` if the dependent is not found.
 */
export const searchMultipleDependentsLocally = async (dependents: any[]) => {
  const results = new Map();

  for (const dependent of dependents) {
    try {
      const existingPatient = await findExistingLocalPatient(dependent.contactData, true);
      results.set(dependent.id, existingPatient);
    } catch (error) {
      results.set(dependent.id, null);
    }
  }

  return results;
};

/**
 * Searches for a patient by identifier value in the local OpenMRS database.
 *
 * @param {string} identifierValue - The value of the identifier to search for
 * @param {string} [identifierType] - The type of identifier to search by, if specified
 * @returns {Promise<Object | null>} The patient record for the matching patient, or `null` if no match is found
 */
export const searchLocalPatientByIdentifier = async (identifierValue: string, identifierType?: string) => {
  if (!identifierValue) {
    return null;
  }

  try {
    const customRepresentation =
      'custom:(patientId,uuid,identifiers,display,patientIdentifier:(uuid,identifier),person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),attributes:(value,attributeType:(uuid,display)))';

    let response = await openmrsFetch(
      `${restBaseUrl}/patient?identifier=${encodeURIComponent(identifierValue)}&v=${customRepresentation}`,
    );

    if (response?.data?.results && response.data.results.length > 0) {
      return response.data.results[0];
    }

    if (!identifierType) {
      response = await openmrsFetch(
        `${restBaseUrl}/patient?q=${encodeURIComponent(identifierValue)}&v=${customRepresentation}`,
      );

      if (response?.data?.results && response.data.results.length > 0) {
        const matchingPatients = response.data.results.filter((patient: any) => {
          return patient.identifiers?.some(
            (id: any) => id.identifier === identifierValue || id.display?.includes(identifierValue),
          );
        });

        if (matchingPatients.length > 0) {
          return matchingPatients[0];
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * @param {string | null} identifierValue - The identifier value to search for, or null to not search.
 * @returns {object} An object containing the local patient, if found, and booleans indicating whether the search is loading or encountered an error.
 *
 * @example
 * const { localPatient, isLoading, error } = useLocalPatientByIdentifier('12345678');
 * if (isLoading) {
 *   // show a loading indicator
 * }
 * if (error) {
 *   // handle the error
 * }
 * if (localPatient) {
 *   // do something with the local patient
 * }
 */
export const useLocalPatientByIdentifier = (identifierValue: string | null) => {
  const { data, error, isLoading } = useSWR(
    identifierValue ? `local-patient-${identifierValue}` : null,
    () => (identifierValue ? searchLocalPatientByIdentifier(identifierValue) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
    },
  );

  return {
    localPatient: data,
    isLoading,
    error,
  };
};

/**
 * Searches for local patients with the given identifiers and returns an array of results.
 *
 * Each result is an object with an `identifier` property (the identifier that was searched for),
 * a `patient` property (the local patient that was found, or null if none was found), and an
 * `error` property (an error message if the search failed, or null if the search was successful).
 *
 * @param {Array<{ value: string; type: string }>} identifiers - The identifiers to search for.
 * @returns {Promise<Array<{ identifier: { value: string; type: string }; patient: LocalPatient | null; error: string | null }>>} The results of the search.
 *
 * @example
 * const results = await searchLocalPatientsByIdentifiers([
 *   { value: '12345678', type: 'national-id' },
 *   { value: '1234567890', type: 'ccc-number' },
 * ]);
 * results.forEach((result) => {
 *   if (result.patient) {
 *     // do something with the local patient
 *   }
 *   if (result.error) {
 *     // handle the error
 *   }
 * });
 */
export const searchLocalPatientsByIdentifiers = async (identifiers: Array<{ value: string; type: string }>) => {
  const results = await Promise.allSettled(
    identifiers.map((identifier) => searchLocalPatientByIdentifier(identifier.value, identifier.type)),
  );

  return results.map((result, index) => ({
    identifier: identifiers[index],
    patient: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
};
