import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';

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
