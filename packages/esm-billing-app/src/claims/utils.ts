import { updateClaimStatus } from './dashboard/form/claims-form.resource';

export const statusColors = {
  ENTERED: 'blue',
  ERRORED: 'red',
  REJECTED: 'red',
  CHECKED: 'green',
  VALUATED: 'purple',
};

/**
 * Update multiple claim statuses in sequence
 *
 * @param {Array<string>} responseUUIDs - Array of response UUIDs to update
 * @param {Function} progressCallback - Callback to track progress
 * @returns {Promise<{success: number, failed: number}>} - Object containing success and failed counts
 */
export async function updateMultipleClaimStatuses(responseUUIDs: Array<string>, progressCallback = null) {
  const results = { success: 0, failed: 0 };

  for (let i = 0; i < responseUUIDs.length; i++) {
    const responseUUID = responseUUIDs[i];

    try {
      await updateClaimStatus(responseUUID);
      results.success++;
    } catch (error) {
      results.failed++;
    }

    if (progressCallback) {
      progressCallback({
        completed: i + 1,
        total: responseUUIDs.length,
        success: results.success,
        failed: results.failed,
      });
    }
  }

  return results;
}

export const formatDateTime = (dateString: string) => {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Converts a formatted date string back to ISO format
 * @param {string} formattedDate - Date string in locale format (e.g., "7/22/2025, 3:03:43 PM")
 * @returns {string} - ISO date string (e.g., "2025-07-22T15:03:43.000Z")
 */
export const convertFormattedDateToISO = (formattedDate) => {
  if (!formattedDate) {
    return null;
  }

  try {
    const date = new Date(formattedDate);
    return date.toISOString();
  } catch {
    return null;
  }
};
