import { makeUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

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
export function convertDateToDays(startDate: string | Date): number {
  const today = dayjs();
  const start = dayjs(startDate);
  return today.diff(start, 'day');
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
