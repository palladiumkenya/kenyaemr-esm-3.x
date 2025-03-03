import { makeUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { z } from 'zod';

/**
 * Generates a URL based on the given path and the current location.
 *
 * @param path - The relative path for the URL.
 * @returns The full URL as a string.
 */

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

/**
 * Calculates the number of days from the given date to today.
 *
 * @param startDate - The starting date in string or Date format.
 * @returns The number of days from the start date to today.
 */
export function convertDateToDays(startDate?: string | Date): number {
  if (!startDate) {
    return 0;
  }

  const start = dayjs(startDate);
  const today = dayjs();

  const diff = today.diff(start, 'day', true);

  if (Math.abs(diff) < 1 && diff !== 0) {
    return 1;
  }

  return Math.abs(Math.round(diff));
}
/**
 * Formats a given date string into "DD-MMM-YYYY, hh:mm A" format.
 *
 * @param {string | Date | undefined} date - The date to format.
 * @returns {string} - The formatted date or an empty string if no date is provided.
 */
export const formatDateTime = (date) => {
  if (!date) {
    return '--';
  }
  return dayjs(date).format('DD-MMM-YYYY, hh:mm A');
};

// Utility functions to get the current date and time

export const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const period = now.getHours() >= 12 ? 'PM' : 'AM';
  return { time: `${hours}:${minutes}`, period };
};

export const patientInfoSchema = z.object({
  dateOfAdmission: z
    .date({ coerce: true })
    .refine((date) => !!date, 'Date of admission is required')
    .refine((date) => date <= new Date(), 'Date of admission cannot be in the future'),
  timeOfDeath: z.string().nonempty('Time of death is required'),
  period: z
    .string()
    .nonempty('AM/PM is required')
    .regex(/^(AM|PM)$/i, 'Invalid period'),
  tagNumber: z.string().nonempty('Tag number is required'),
  obNumber: z.string().optional(),
  policeName: z.string().optional(),
  policeIDNo: z.string().optional(),
  dischargeArea: z.string().optional(),
  visitType: z.string().uuid('invalid visit type'),
  availableCompartment: z.number({ coerce: true }),
  services: z.array(z.string().uuid('invalid service')).nonempty('Must select one service'),
  paymentMethod: z.string().uuid('invalid payment method'),
  insuranceScheme: z.string().optional(),
  policyNumber: z.string().optional(),
});

export const dischargeSchema = z.object({
  dateOfDischarge: z.date({ coerce: true }).refine((date) => !!date, 'Date of discharge is required'),
  timeOfDischarge: z.string().nonempty('Time of discharge is required'),
  period: z
    .string()
    .nonempty('AM/PM is required')
    .regex(/^(AM|PM)$/i, 'Invalid period'),
  burialPermitNumber: z.string().nonempty('Burial Permit Number is required'),
  nextOfKinNames: z.string().nonempty('Next of kin names is required'),
  relationshipType: z.string().nonempty('Next of kin relationship is required'),
  nextOfKinAddress: z.string().nonempty('Next of kin address is required'),
  nextOfKinContact: z
    .string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .nonempty('Next of kin phone number is required'),
});
