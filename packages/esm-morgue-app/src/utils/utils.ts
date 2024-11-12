import { makeUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export function makeUrlUrl(path: string) {
  return new URL(makeUrl(path), window.location.toString());
}
export const formatDeceasedName = (patient) => {
  if (!patient || !patient.name || patient.name.length === 0) {
    return '';
  }

  const nameObj = patient.name[0];
  const givenNames = nameObj.given ? nameObj.given.join(' ') : '';
  const familyName = nameObj.family || '';

  return `${givenNames} ${familyName}`.trim();
};
