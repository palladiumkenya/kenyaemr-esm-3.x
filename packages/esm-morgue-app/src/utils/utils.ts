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

/**
 * Returns the current time in 12-hour format as an object with `time` and `period` properties.
 *
 * @returns {Object} - An object with `time` and `period` properties.
 * @property {string} time - The current time in HH:MM format, e.g. "12:34".
 * @property {string} period - The period of the day, either "AM" or "PM".
 */
export const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const period = now.getHours() >= 12 ? 'PM' : 'AM';
  return { time: `${hours}:${minutes}`, period };
};

export function parseDisplayText(displayText: string): { name: string; openmrsId: string } | null {
  const regex = /(.*) \(OpenMRS ID: (.*)\)/;
  const match = displayText.match(regex);

  if (match && match.length === 3) {
    const name = match[1].trim();
    const openmrsId = match[2].trim();
    return { name, openmrsId };
  } else {
    return null;
  }
}

export const parseDischargeDateTime = (data: {
  dateOfDischarge: string | Date;
  timeOfDischarge?: string;
  period?: string;
}) => {
  const dischargeDateTime =
    typeof data.dateOfDischarge === 'string' ? new Date(data.dateOfDischarge) : new Date(data.dateOfDischarge);

  if (data.timeOfDischarge && data.period) {
    const [hours, minutes] = data.timeOfDischarge.split(':');
    let hour = parseInt(hours, 10);

    if (data.period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (data.period === 'AM' && hour === 12) {
      hour = 0;
    }

    dischargeDateTime.setHours(hour, parseInt(minutes, 10), 0, 0);
  }

  return dischargeDateTime;
};
