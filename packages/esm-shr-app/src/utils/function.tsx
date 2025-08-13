import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import { formatDate, Patient } from '@openmrs/esm-framework';

export function extractNameString(formattedString) {
  if (!formattedString) {
    return '';
  }
  const parts = formattedString.split(' - ');
  return parts.length > 1 ? parts[1] : '';
}
export const formatPatientName = (patient) => {
  if (!patient || !patient.name || patient.name.length === 0) {
    return '';
  }

  const nameObj = patient.name[0];
  const givenNames = nameObj.given ? nameObj.given.join(' ') : '';
  const familyName = nameObj.family || '';

  return `${givenNames} ${familyName}`.trim();
};
export const uppercaseText = (text) => {
  return text.toUpperCase();
};

function customizer(objValue: Record<string, any>, srcValue: Record<string, any>) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

export function deepMerge(obj1: Record<string, any>, obj2: Record<string, any>) {
  return mergeWith({}, obj1, obj2, customizer);
}

export const getPatientName = (patient: Patient) => {
  let displayName = '';

  if (patient?.person?.preferredName?.display) {
    displayName = patient.person.preferredName.display;
  } else if (patient?.person?.display || patient?.display) {
    displayName = patient.person?.display || patient.display;
  }

  if (displayName) {
    const nameParts = displayName.trim().split(/\s+/).filter(Boolean);

    if (nameParts.length === 1) {
      return {
        FIRST_NAME: nameParts[0],
        MIDDLE_NAME: '',
        LAST_NAME: '',
      };
    }

    if (nameParts.length === 2) {
      return {
        FIRST_NAME: nameParts[0],
        MIDDLE_NAME: '',
        LAST_NAME: nameParts[1],
      };
    }

    return {
      FIRST_NAME: nameParts[0],
      MIDDLE_NAME: nameParts.slice(1, -1).join(' '),
      LAST_NAME: nameParts[nameParts.length - 1],
    };
  }

  return {
    FIRST_NAME: '',
    MIDDLE_NAME: '',
    LAST_NAME: '',
  };
};

export const getPatientGender = (patient: Patient) => {
  const gender = patient?.person?.gender;
  if (gender) {
    const genderUpper = gender.toUpperCase();
    if (genderUpper === 'MALE' || genderUpper === 'M') {
      return 'M';
    }
    if (genderUpper === 'FEMALE' || genderUpper === 'F') {
      return 'F';
    }
    return genderUpper.charAt(0);
  }

  return 'M';
};
export const getPatientAddress = (patient: Patient) => {
  if (patient?.person?.preferredAddress?.display) {
    const addressParts = patient.person.preferredAddress.display.split(',').map((part) => part.trim());
    return {
      VILLAGE: addressParts[0] || 'VILLAGE',
      WARD: addressParts[1] || 'VILLAGE',
      SUB_COUNTY: addressParts[2] || 'VILLAGE',
      COUNTY: addressParts[3] || 'COUNTY',
      GPS_LOCATION: null,
      NEAREST_LANDMARK: null,
    };
  }

  if (patient?.person?.attributes?.length) {
    const addressAttrs = patient.person.attributes.filter(
      (attr) =>
        attr.attributeType?.display?.toLowerCase().includes('address') ||
        attr.attributeType?.display?.toLowerCase().includes('location') ||
        attr.attributeType?.display?.toLowerCase().includes('county') ||
        attr.attributeType?.display?.toLowerCase().includes('village'),
    );

    if (addressAttrs.length > 0) {
      return {
        VILLAGE:
          addressAttrs.find((a) => a.attributeType?.display?.toLowerCase().includes('village'))?.value || 'VILLAGE',
        WARD: addressAttrs.find((a) => a.attributeType?.display?.toLowerCase().includes('ward'))?.value || 'VILLAGE',
        SUB_COUNTY:
          addressAttrs.find((a) => a.attributeType?.display?.toLowerCase().includes('sub'))?.value || 'VILLAGE',
        COUNTY: addressAttrs.find((a) => a.attributeType?.display?.toLowerCase().includes('county'))?.value || 'COUNTY',
        GPS_LOCATION: null,
        NEAREST_LANDMARK: null,
      };
    }
  }

  return {
    VILLAGE: 'VILLAGE',
    WARD: 'VILLAGE',
    SUB_COUNTY: 'VILLAGE',
    COUNTY: 'COUNTY',
    GPS_LOCATION: null,
    NEAREST_LANDMARK: null,
  };
};

export const getPatientIdentifiers = (patient: Patient) => {
  const identifiers = [];

  if (patient?.identifiers?.length) {
    patient.identifiers.forEach((id) => {
      if (id.identifier && id.identifierType?.name) {
        const idTypeName = id.identifierType.name.toUpperCase();

        if (
          idTypeName.includes('CCC') ||
          idTypeName.includes('COMPREHENSIVE') ||
          idTypeName.includes('CARE') ||
          idTypeName.includes('CLINIC')
        ) {
          identifiers.push({
            ID: id.identifier,
            IDENTIFIER_TYPE: 'CCC_NUMBER',
            ASSIGNING_AUTHORITY: 'CCC',
          });
        } else if (idTypeName.includes('NATIONAL') || idTypeName.includes('ID')) {
          identifiers.push({
            ID: id.identifier,
            IDENTIFIER_TYPE: 'NATIONAL_ID',
            ASSIGNING_AUTHORITY: 'GOK',
          });
        } else if (idTypeName.includes('FACILITY') || idTypeName.includes('MRN')) {
          identifiers.push({
            ID: id.identifier,
            IDENTIFIER_TYPE: 'FACILITY_ID',
            ASSIGNING_AUTHORITY: 'FACILITY',
          });
        }
      }
    });
  }

  if (identifiers.length === 0) {
    const defaultCccNumber = `1234567${String(Math.floor(Math.random() * 100)).padStart(2, '0')}${Math.floor(
      Math.random() * 10,
    )}`;
    identifiers.push({
      ID: defaultCccNumber,
      IDENTIFIER_TYPE: 'CCC_NUMBER',
      ASSIGNING_AUTHORITY: 'CCC',
    });
  }

  return identifiers;
};

export const getPhoneNumber = (patient: Patient) => {
  if (patient?.person?.attributes?.length) {
    const phoneAttr = patient.person.attributes.find(
      (attr) =>
        attr.attributeType?.display?.toLowerCase().includes('phone') ||
        attr.attributeType?.display?.toLowerCase().includes('contact') ||
        attr.attributeType?.display?.toLowerCase().includes('telephone'),
    );
    return phoneAttr?.value || '';
  }
  return '';
};

export const formatBirthDate = (patient: Patient) => {
  const birthDate = patient?.person?.birthdate;
  if (birthDate) {
    return formatDate(new Date(birthDate), { mode: 'standard' });
  }
  return '';
};

export const getPatientDeathInfo = (patient: Patient) => {
  const dead = patient?.person?.dead;
  const deathDate = patient?.person?.deathDate;

  return {
    DEATH_DATE: dead && deathDate ? formatDate(new Date(deathDate), { mode: 'standard' }) : null,
    DEATH_INDICATOR: dead ? 'YES' : null,
  };
};
