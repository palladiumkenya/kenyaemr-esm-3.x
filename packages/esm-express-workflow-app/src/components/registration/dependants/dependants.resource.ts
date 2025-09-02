import { getSessionLocation, launchWorkspace, openmrsFetch, restBaseUrl, showSnackbar } from "@openmrs/esm-framework";
import { DependentPayload } from "../type";
import { generateIdentifier, getIdentifierTypeUUID } from "../helper";
import { openmrsId, openmrsIdSource } from "../constant";

export async function createDependentPatient(dependent: DependentPayload, t) {
  try {
    const { dependentInfo } = dependent;
    const locationUuid = (await getSessionLocation()).uuid;

    const identifiers = dependentInfo.extension
      .filter((ext) => ext.url === 'identifiers' && ext.valueIdentifier)
      .map((ext, index) => ({
        identifier: ext.valueIdentifier.value,
        identifierType: getIdentifierTypeUUID(ext.valueIdentifier.type.coding[0].code),
        location: locationUuid,
        preferred: false,
      }))
      .filter((identifier) => identifier.identifierType);
    if (identifiers.length > 0) {
      identifiers[0].preferred = true;
    }

    const birthdate = dependentInfo.extension.find(
      (ext) => ext.url === 'https://ts.kenya-hie.health/fhir/StructureDefinition/date_of_birth',
    )?.valueString;

    const givenNames = dependentInfo.name.given || [];
    let familyName = dependentInfo.name.family || '';

    let givenName = '';
    let middleName = '';

    if (givenNames.length > 0) {
      givenName = givenNames[0];
      middleName = givenNames.slice(1).join(' ');
    } else if (dependentInfo.name.text) {
      const nameParts = dependentInfo.name.text.trim().split(' ');
      givenName = nameParts[0] || '';
      middleName = nameParts.slice(1, -1).join(' ');
      if (!familyName && nameParts.length > 1) {
        familyName = nameParts[nameParts.length - 1];
      }
    }

    const payload = {
      person: {
        names: [
          {
            preferred: true,
            givenName: givenName || 'Unknown',
            middleName: middleName || '',
            familyName: familyName || 'Unknown',
          },
        ],
        gender: dependentInfo.gender.charAt(0).toUpperCase(),
        birthdate: birthdate || null,
        birthdateEstimated: !birthdate,
        attributes: [],
        addresses: [
          {
            address1: '',
            cityVillage: '',
            country: dependentInfo.address?.country || '',
            postalCode: '',
            stateProvince: '',
          },
        ],
      },
      identifiers: [...identifiers],
    };


    try {
      const identifierResponse = await generateIdentifier(openmrsIdSource);
      const location = await getSessionLocation();

      const openmrsIdentifier = {
        identifier: identifierResponse.data.identifier,
        identifierType: openmrsId,
        location: location.uuid,
        preferred: identifiers.length === 0,
      };

      payload.identifiers.push(openmrsIdentifier);

      if (identifiers.length > 0) {
        payload.identifiers.forEach((id) => {
          if (id.identifierType !== openmrsId) {
            id.preferred = false;
          }
        });
        openmrsIdentifier.preferred = true;
      }
    } catch (identifierError) {
      console.warn('Failed to generate OpenMRS identifier, proceeding without it:', identifierError);
    }

    if (payload.identifiers.length === 0) {
      throw new Error('No valid identifiers found for the dependent');
    }

    const response = await openmrsFetch(`${restBaseUrl}/patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    showSnackbar({
      title: t('dependentRegisteredSuccessfully', 'Dependent registered successfully'),
      subtitle: t('dependentRegisteredSuccessfullySubtitle', 'You can now start a visit for the dependent'),
      kind: 'success',
      isLowContrast: true,
    });

    const startVisitWorkspaceForm = 'start-visit-workspace-form';
    const patientUuid = response.data.uuid;

    launchWorkspace(startVisitWorkspaceForm, {
      patientUuid,
      openedFrom: 'patient-chart-start-visit',
    });

    return response.data;
  } catch (error) {
    console.error('Error creating dependent patient:', error);

    let errorMessage = t('dependentRegistrationFailedSubtitle', 'Please try again or contact support');

    if (error?.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    showSnackbar({
      title: t('dependentRegistrationFailed', 'Dependent registration failed'),
      subtitle: errorMessage,
      kind: 'error',
      isLowContrast: true,
    });

    throw error;
  }
}
