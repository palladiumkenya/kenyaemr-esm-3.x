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
