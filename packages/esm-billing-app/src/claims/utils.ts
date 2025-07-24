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
