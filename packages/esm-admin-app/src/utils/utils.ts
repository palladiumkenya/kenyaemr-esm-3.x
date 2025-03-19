import dayjs from 'dayjs';

/**
 * Formats a given date string into "DD-MMM-YYYY, hh:mm A" format.
 *
 * @param {string | Date | undefined} date - The date to format.
 * @returns {string} - The formatted date or '--' if the date is invalid or missing.
 */
export const formatDateTime = (date) => {
  if (!date) {
    return '--';
  }

  const parsedDate = dayjs(date);
  if (!parsedDate.isValid()) {
    return '--';
  }

  return parsedDate.format('DD-MMM-YYYY, hh:mm A');
};
