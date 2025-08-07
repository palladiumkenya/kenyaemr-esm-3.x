import { EnhancedPatient, MortuaryPatient, Patient } from '../types';

/**
 * Converts a string to uppercase.
 * @param {string} str - The string to convert.
 * @return {string} - The uppercase string.
 */
export const toUpperCase = (str) => {
  if (!str) {
    return '';
  } // Handle empty or undefined input
  return str.toUpperCase();
};

/**
 * Transforms a MortuaryPatient object into an EnhancedPatient.
 * @param {MortuaryPatient} mortuaryPatient - The MortuaryPatient object to transform.
 * @return {EnhancedPatient} - The transformed EnhancedPatient.
 */
export const transformMortuaryPatient = (mortuaryPatient: MortuaryPatient): EnhancedPatient => ({
  uuid: mortuaryPatient.person?.person?.uuid || mortuaryPatient.person?.uuid,
  person: {
    display: mortuaryPatient.person?.person?.display || mortuaryPatient.person?.display,
    gender: mortuaryPatient.person?.person?.gender || mortuaryPatient.person?.gender,
    age: mortuaryPatient.person?.person?.age || mortuaryPatient.person?.age,
    deathDate: mortuaryPatient.person?.person?.deathDate || mortuaryPatient.person?.deathDate,
    causeOfDeath: mortuaryPatient.person?.person?.causeOfDeath || mortuaryPatient.person?.causeOfDeath,
  },
  originalMortuaryPatient: mortuaryPatient,
});

/**
 * Transforms a Patient object into an EnhancedPatient with bed information.
 * @param {Patient} patient - The Patient object to transform.
 * @param {Object} bedInfo - The bed information associated with the patient.
 * @param {string} bedInfo.bedNumber - The bed number assigned to the patient.
 * @param {number} bedInfo.bedId - The unique identifier for the bed.
 * @param {string} [bedInfo.bedType] - The type of bed assigned, if available.
 * @return {EnhancedPatient} - The transformed EnhancedPatient with bed details.
 */

export const transformAdmittedPatient = (
  patient: Patient,
  bedInfo: { bedNumber: string; bedId: number; bedType?: string },
): EnhancedPatient => ({
  uuid: patient.uuid,
  person: {
    display: patient.person?.display,
    gender: patient.person?.gender,
    age: patient.person?.age,
    deathDate: patient.person?.deathDate,
    causeOfDeath: patient.person?.causeOfDeath,
  },
  bedInfo,
  originalPatient: patient,
});

/**
 * Transforms a Patient object into an EnhancedPatient with a discharged status and optional encounter date.
 * @param {Patient} patient - The Patient object to transform.
 * @param {string} [encounterDate] - The date of the encounter for the patient's discharge.
 * @return {EnhancedPatient} - The transformed EnhancedPatient with a discharged status.
 */
export const transformDischargedPatient = (patient: Patient, encounterDate?: string): EnhancedPatient => ({
  uuid: patient.uuid,
  person: {
    display: patient.person?.display,
    gender: patient.person?.gender,
    age: patient.person?.age,
    deathDate: patient.person?.deathDate,
    causeOfDeath: patient.person?.causeOfDeath,
  },
  isDischarged: true,
  encounterDate,
  originalPatient: patient,
});

/**
 * Retrieves the original MortuaryPatient or Patient object from an EnhancedPatient,
 * if present. If neither is available, returns null.
 * @param {EnhancedPatient} enhancedPatient - The EnhancedPatient object to extract the original patient from.
 * @return {MortuaryPatient | Patient | null} - The original MortuaryPatient or Patient if available, or null.
 */
export const getOriginalPatient = (enhancedPatient: EnhancedPatient): MortuaryPatient | Patient | null => {
  if (enhancedPatient.originalMortuaryPatient) {
    return enhancedPatient.originalMortuaryPatient;
  }
  if (enhancedPatient.originalPatient) {
    return enhancedPatient.originalPatient;
  }
  return null;
};

/**
 * Extracts the original Patient object from an EnhancedPatient, if available.
 * @param {EnhancedPatient} enhancedPatient - The EnhancedPatient object to extract the original patient from.
 * @return {Patient | null} - The original Patient if available, or null.
 * If the EnhancedPatient has an originalPatient property, that will be returned directly.
 * If the EnhancedPatient has an originalMortuaryPatient property with a patient property, that will be returned.
 * If neither of the above conditions are met, a partial Patient object will be created from the EnhancedPatient data.
 * Note that this partial Patient object will not have the full set of properties a real Patient object would have.
 */
export const extractPatientFromEnhanced = (enhancedPatient: EnhancedPatient): Patient | null => {
  if (enhancedPatient.originalPatient) {
    return enhancedPatient.originalPatient;
  }

  if (enhancedPatient.originalMortuaryPatient?.patient) {
    return enhancedPatient.originalMortuaryPatient.patient;
  }
  return {
    uuid: enhancedPatient.uuid,
    display: enhancedPatient.person.display,
    identifiers: [],
    person: {
      uuid: enhancedPatient.uuid,
      display: enhancedPatient.person.display,
      gender: enhancedPatient.person.gender,
      age: enhancedPatient.person.age,
      birthdate: '',
      birthdateEstimated: false,
      dead: true,
      deathDate: enhancedPatient.person.deathDate,
      causeOfDeath: enhancedPatient.person.causeOfDeath || { uuid: '', display: '' },
      preferredAddress: { uuid: '', display: '' },
      attributes: [],
      voided: false,
      birthtime: null,
      deathdateEstimated: false,
      identifiers: [],
    },
  } as Patient;
};
