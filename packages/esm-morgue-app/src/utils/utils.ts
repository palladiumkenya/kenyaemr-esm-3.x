import { makeUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export function makeUrlUrl(path: string) {
  return new URL(makeUrl(path), window.location.toString());
}

/**
 * Formats a date to "October 20 2024, 01:53 PM" format.
 * @param {string|Date|number} date - The date to format, can be a Date object, timestamp, or ISO string.
 * @returns {string} - The formatted date string.
 */
export function formatToReadableDate(date) {
  return dayjs(date).format('MMMM DD YYYY, hh:mm A');
}
