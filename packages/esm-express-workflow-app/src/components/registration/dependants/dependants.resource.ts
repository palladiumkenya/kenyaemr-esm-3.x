import { getSessionLocation, launchWorkspace, openmrsFetch, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { DependentPayload, HIEPatient } from '../type';
import { generateIdentifier, getIdentifierTypeUUID } from '../helper';
import { openmrsId, openmrsIdSource } from '../constant';

export interface PatientRegistrationPayload {
  name: string;
  gender: string;
  birthDate?: string;
  patientData: HIEPatient | any; // Can be HIE patient or dependent contact data
  type: 'hie-patient' | 'dependent';
}

export async function createPatient(payload: PatientRegistrationPayload, t: any) {
  try {
    const { patientData, type, name, gender, birthDate } = payload;
    const locationUuid = (await getSessionLocation()).uuid;

    let identifiers = [];
    let givenName = '';
    let middleName = '';
    let familyName = '';
    let patientBirthDate = birthDate;
    let patientGender = gender;
    let addresses = [];

    if (type === 'hie-patient') {
      // Handle HIE Patient registration
      const hiePatient = patientData as HIEPatient;

      // Extract identifiers from HIE patient
      identifiers =
        hiePatient.identifier
          ?.map((id) => ({
            identifier: id.value,
            identifierType: getIdentifierTypeUUID(id.type.coding[0].code),
            location: locationUuid,
            preferred: false,
          }))
          .filter((identifier) => identifier.identifierType) || [];

      // Extract names
      const patientName = hiePatient.name?.[0];
      if (patientName) {
        givenName = patientName.given?.[0] || '';
        middleName = patientName.given?.slice(1).join(' ') || '';
        familyName = patientName.family || '';

        // Fallback to text if structured name is not available
        if (!givenName && !familyName && patientName.text) {
          const nameParts = patientName.text.trim().split(' ');
          givenName = nameParts[0] || '';
          middleName = nameParts.slice(1, -1).join(' ');
          familyName = nameParts[nameParts.length - 1] || '';
        }
      }

      patientBirthDate = hiePatient.birthDate;
      patientGender = hiePatient.gender;

      // Extract addresses
      addresses =
        hiePatient.address?.map((addr) => ({
          address1: '',
          address2: '',
          cityVillage: addr.city || '',
          country: addr.country || '',
          postalCode: '',
          stateProvince: '',
          countyDistrict: '',
        })) || [];
    } else if (type === 'dependent') {
      // Handle dependent registration (existing logic)
      const dependentInfo = patientData;

      identifiers =
        dependentInfo.extension
          ?.filter((ext: any) => ext.url === 'identifiers' && ext.valueIdentifier)
          .map((ext: any) => ({
            identifier: ext.valueIdentifier.value,
            identifierType: getIdentifierTypeUUID(ext.valueIdentifier.type.coding[0].code),
            location: locationUuid,
            preferred: false,
          }))
          .filter((identifier: any) => identifier.identifierType) || [];

      const birthdate = dependentInfo.extension?.find(
        (ext: any) => ext.url === 'https://ts.kenya-hie.health/fhir/StructureDefinition/date_of_birth',
      )?.valueString;

      const givenNames = dependentInfo.name?.given || [];
      familyName = dependentInfo.name?.family || '';

      if (givenNames.length > 0) {
        givenName = givenNames[0];
        middleName = givenNames.slice(1).join(' ');
      } else if (dependentInfo.name?.text) {
        const nameParts = dependentInfo.name.text.trim().split(' ');
        givenName = nameParts[0] || '';
        middleName = nameParts.slice(1, -1).join(' ');
        if (!familyName && nameParts.length > 1) {
          familyName = nameParts[nameParts.length - 1];
        }
      }

      patientBirthDate = birthdate;
      patientGender = dependentInfo.gender;
      addresses = [
        {
          address1: '',
          cityVillage: '',
          country: dependentInfo.address?.country || '',
          postalCode: '',
          stateProvince: '',
        },
      ];
    }

    // Set preferred identifier
    if (identifiers.length > 0) {
      identifiers[0].preferred = true;
    }

    // Extract phone number for attributes
    const phoneAttributes = [];
    if (type === 'hie-patient') {
      const phoneContact = patientData.telecom?.find((t: any) => t.system === 'phone');
      if (phoneContact?.value) {
        phoneAttributes.push({
          attributeType: 'b2c38640-2603-4629-aebd-3b54f33f1e3a', // Telephone contact attribute type UUID
          value: phoneContact.value,
        });
      }
    }

    const registrationPayload = {
      person: {
        names: [
          {
            preferred: true,
            givenName: givenName || 'Unknown',
            middleName: middleName || '',
            familyName: familyName || 'Unknown',
          },
        ],
        gender: patientGender?.charAt(0).toUpperCase() || 'U',
        birthdate: patientBirthDate || null,
        birthdateEstimated: !patientBirthDate,
        attributes: phoneAttributes,
        addresses:
          addresses.length > 0
            ? addresses
            : [
                {
                  address1: '',
                  cityVillage: '',
                  country: '',
                  postalCode: '',
                  stateProvince: '',
                },
              ],
      },
      identifiers: [...identifiers],
    };

    // Generate OpenMRS identifier
    try {
      const identifierResponse = await generateIdentifier(openmrsIdSource);
      const location = await getSessionLocation();

      const openmrsIdentifier = {
        identifier: identifierResponse.data.identifier,
        identifierType: openmrsId,
        location: location.uuid,
        preferred: identifiers.length === 0,
      };

      registrationPayload.identifiers.push(openmrsIdentifier);

      if (identifiers.length > 0) {
        registrationPayload.identifiers.forEach((id) => {
          if (id.identifierType !== openmrsId) {
            id.preferred = false;
          }
        });
        openmrsIdentifier.preferred = true;
      }
    } catch (identifierError) {
      console.warn('Failed to generate OpenMRS identifier, proceeding without it:', identifierError);
    }

    if (registrationPayload.identifiers.length === 0) {
      throw new Error('No valid identifiers found for the patient');
    }

    const response = await openmrsFetch(`${restBaseUrl}/patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: registrationPayload,
    });

    const patientType = type === 'hie-patient' ? 'patient' : 'dependent';

    showSnackbar({
      title: t(`${patientType}RegisteredSuccessfully`, `${patientType} registered successfully`),
      subtitle: t(`${patientType}RegisteredSuccessfullySubtitle`, `You can now start a visit for the ${patientType}`),
      kind: 'success',
      isLowContrast: true,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating patient:', error);

    const patientType = payload.type === 'hie-patient' ? 'Patient' : 'Dependent';
    let errorMessage = t(
      `${patientType.toLowerCase()}RegistrationFailedSubtitle`,
      'Please try again or contact support',
    );

    if (error?.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    showSnackbar({
      title: t(`${patientType.toLowerCase()}RegistrationFailed`, `${patientType} registration failed`),
      subtitle: errorMessage,
      kind: 'error',
      isLowContrast: true,
    });

    throw error;
  }
}

// Wrapper function for backward compatibility with dependent registration
export async function createDependentPatient(dependent: DependentPayload, t: any) {
  const payload: PatientRegistrationPayload = {
    name: dependent.name,
    gender: dependent.gender,
    patientData: dependent.dependentInfo,
    type: 'dependent',
  };

  const result = await createPatient(payload, t);

  // Launch start visit workspace for dependents
  launchWorkspace('start-visit-workspace-form', {
    patientUuid: result.uuid,
    workspaceTitle: t('startVisitWorkspaceTitle', 'Start Visit for {{patientName}}', {
      patientName: dependent.name,
    }),
  });

  return result;
}

// New function for HIE patient registration
export async function createHIEPatient(hiePatient: HIEPatient, t: any) {
  const patientName =
    hiePatient.name?.[0]?.text ||
    `${hiePatient.name?.[0]?.given?.join(' ') || ''} ${hiePatient.name?.[0]?.family || ''}`.trim() ||
    'Unknown Patient';

  const payload: PatientRegistrationPayload = {
    name: patientName,
    gender: hiePatient.gender,
    birthDate: hiePatient.birthDate,
    patientData: hiePatient,
    type: 'hie-patient',
  };

  const result = await createPatient(payload, t);

  // Launch start visit workspace for HIE patients after registration
  launchWorkspace('start-visit-workspace-form', {
    patientUuid: result.uuid,
    workspaceTitle: t('startVisitWorkspaceTitle', 'Start Visit for {{patientName}}', {
      patientName: patientName,
    }),
  });

  return result;
}
