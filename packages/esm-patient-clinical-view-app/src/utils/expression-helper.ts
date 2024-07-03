import { PatientProgram } from '@openmrs/esm-patient-common-lib';

/**
 * Evaluates a given expression using patient data and their program enrollments.
 * @param {string} expression - The expression to evaluate, which can reference patient data and enrollment names.
 * @param {fhir.Patient} patient - The patient's FHIR data object.
 * @param {Array<PatientProgram>} enrollments - An array of PatientProgram objects representing the patient's program enrollments.
 * @returns {boolean} - The result of the evaluated expression. Returns true if the expression is successfully evaluated, or if the expression or patient data is missing. Returns false if there's an error in evaluation.
 */
export const evaluateExpression = (expression, patient, enrollments) => {
  const enrollment = enrollments?.flatMap((enrollment) => enrollment?.program['name']);
  const programUuids = enrollments?.flatMap((enrollment) => enrollment?.program['uuid']);
  const { age, ageInDays, ageInMonths, ageInYears } = calculateAge(new Date(patient?.birthDate));
  try {
    if (!expression || !patient) {
      return true;
    }
    return new Function('patient', 'enrollment', 'programUuids', `return ${expression}`)(
      patient,
      enrollment,
      programUuids,
    );
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return false;
  }
};

/**
 * Calculates the age in years, months, and days from a given date of birth.
 * @param {Date} dob - The date of birth to calculate age from.
 * @returns {Object} An object containing age in years (`ageInYears`), months (`ageInMonths`), and days (`ageInDays`), as well as a general `age` property representing age in complete years.
 */
function calculateAge(dob: Date) {
  const today = new Date();
  const birthDate = new Date(dob);
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;
  }

  if (days < 0) {
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
    months--;
  }

  const totalMonths = years * 12 + months;
  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round(Math.abs((today.getTime() - birthDate.getTime()) / oneDay));

  return { ageInYears: years, ageInMonths: totalMonths, ageInDays: totalDays, age: years };
}

export function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
}
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
