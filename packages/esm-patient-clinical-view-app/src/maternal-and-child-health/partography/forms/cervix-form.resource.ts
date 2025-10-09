/**
 * Hook to fetch oxytocin data for a patient
 */
export function useOxytocinData(patientUuid: string) {
  const encounterRepresentation =
    'custom:(uuid,encounterDatetime,encounterType:(uuid,display),' +
    'obs:(uuid,concept:(uuid,display),value,obsDatetime,display),' +
    'patient:(uuid))';

  const url = `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=${encounterRepresentation}`;

  const { data, error, isLoading, mutate } = useSWR<{
    data: {
      results: any[];
    };
  }>(patientUuid ? url : null, openmrsFetch);

  // Process and transform the raw encounter data
  const oxytocinData = data?.data?.results || [];

  // Sort encounters by date (newest first)
  const sortedEncounters = oxytocinData.sort(
    (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
  );

  // Transform encounters to usable data format
  const transformedData = sortedEncounters.map((encounter) => {
    const observations = encounter.obs || [];

    // Extract specific observations by concept UUID
    const timeObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.time);
    const dropsObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.oxytocinDropsPerMinute);

    return {
      uuid: encounter.uuid,
      encounterDatetime: encounter.encounterDatetime,
      time: timeObs?.value ? String(timeObs.value) : null,
      dropsPerMinute: dropsObs?.value ? Number(dropsObs.value) : null,
      // Combined display for easier use
      timeDisplay: timeObs?.value ? `${timeObs.value}` : null,
    };
  });

  // Extract arrays for easier chart integration
  const existingOxytocinEntries = transformedData
    .filter((data) => data.time !== null && data.dropsPerMinute !== null)
    .map((data) => ({ time: data.time!, dropsPerMinute: data.dropsPerMinute! }));

  return {
    encounters: sortedEncounters,
    oxytocinData: transformedData,
    existingOxytocinEntries,
    isLoading,
    error,
    mutate,
  };
}
// Map descent of head concept UUIDs to numeric values for graphing
export const DESCENT_OF_HEAD_UUID_TO_VALUE: Record<string, number> = {
  '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 0, // 0/5
  '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 1, // 1/5
  '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 2, // 2/5
  '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 3, // 3/5
  '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 4, // 4/5
  '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 5, // 5/5
};
import { openmrsFetch, restBaseUrl, toOmrsIsoString, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';

// OpenMRS Concept UUIDs for Cervix Form Data
export const CERVIX_FORM_CONCEPTS = {
  hour: '159682AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Use numeric concept UUID for hour (send as number)
  time: '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Description concept (text) - should accept any text
  cervicalDilation: '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  descentOfHead: '159682AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Now use numeric concept for descent
  oxytocinDropsPerMinute: '166531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Numeric concept for drops per minute
} as const;
// Types for Oxytocin Form Data
export interface OxytocinFormData {
  time: string;
  dropsPerMinute: string;
}

export interface SaveOxytocinDataResponse {
  success: boolean;
  message: string;
  encounter?: any;
  error?: string;
}

/**
 * Save oxytocin data to OpenMRS
 */
export async function saveOxytocinFormData(
  patientUuid: string,
  formData: OxytocinFormData,
  providerUuid?: string,
  locationUuid?: string,
): Promise<SaveOxytocinDataResponse> {
  try {
    // Build observations from form data
    const observations = buildOxytocinObservations(formData);

    // Log missing fields for debugging
    const missingFields = [];
    if (!formData.time || formData.time.trim() === '') {
      missingFields.push('time');
    }
    if (!formData.dropsPerMinute || isNaN(parseFloat(formData.dropsPerMinute))) {
      missingFields.push('dropsPerMinute');
    }
    if (missingFields.length > 0) {
      console.warn('Missing or invalid oxytocin fields:', missingFields);
      return {
        success: false,
        message: `Missing or invalid fields: ${missingFields.join(', ')}`,
        error: 'INVALID_FIELDS',
      };
    }

    // Get current session for provider/location if not provided
    const session = await getCurrentSession();
    const finalProviderUuid = providerUuid || session?.currentProvider?.uuid;
    const finalLocationUuid = locationUuid || session?.sessionLocation?.uuid;

    if (!finalProviderUuid) {
      return {
        success: false,
        message: 'Provider information is required',
        error: 'NO_PROVIDER',
      };
    }

    if (!finalLocationUuid) {
      return {
        success: false,
        message: 'Location information is required',
        error: 'NO_LOCATION',
      };
    }

    // Set encounterDatetime to 1 minute before current time to avoid future datetime error
    const now = new Date();
    now.setMinutes(now.getMinutes() - 1);
    const encounterPayload = {
      patient: patientUuid,
      encounterType: MCH_PARTOGRAPHY_ENCOUNTER_UUID,
      location: finalLocationUuid,
      encounterDatetime: toOmrsIsoString(now),
      obs: observations,
      encounterProviders: [
        {
          provider: finalProviderUuid,
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f', // Default encounter role UUID
        },
      ],
    };

    // Save encounter to OpenMRS
    const response = await openmrsFetch(`${restBaseUrl}/encounter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encounterPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to save oxytocin data: ${response.status} ${response.statusText}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = `Failed to save oxytocin data: ${errorData.error.message}`;
        }
      } catch (e) {
        // Use default error message
      }

      return {
        success: false,
        message: errorMessage,
        error: 'SAVE_FAILED',
      };
    }

    const encounter = await response.json();

    return {
      success: true,
      message: 'Oxytocin data saved successfully',
      encounter,
    };
  } catch (error) {
    console.error('Error saving oxytocin form data:', error);
    return {
      success: false,
      message: `Failed to save oxytocin data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'EXCEPTION',
    };
  }
}

/**
 * Build observations array from oxytocin form data
 */
function buildOxytocinObservations(formData: OxytocinFormData): any[] {
  const observations = [];
  const obsDatetime = toOmrsIsoString(new Date());

  // Time observation (send as string)
  if (formData.time && formData.time !== '') {
    observations.push({
      concept: CERVIX_FORM_CONCEPTS.time,
      value: formData.time,
      obsDatetime,
    });
  }

  // Drops per minute observation (send as number for numeric concept)
  if (formData.dropsPerMinute && formData.dropsPerMinute !== '') {
    const dropsValue = parseFloat(formData.dropsPerMinute);
    if (!isNaN(dropsValue)) {
      observations.push({
        concept: CERVIX_FORM_CONCEPTS.oxytocinDropsPerMinute,
        value: dropsValue,
        obsDatetime,
      });
    }
  }

  return observations;
}

export const MCH_PARTOGRAPHY_ENCOUNTER_UUID = '022d62af-e2a5-4282-953b-52dd5cba3296';

// Types for Cervix Form Data
export interface CervixFormData {
  hour: string;
  time: string;
  cervicalDilation: string;
  descent: string;
}

export interface CervixObservation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
  };
  value: number | string;
  obsDatetime: string;
  display: string;
}

export interface CervixEncounter {
  uuid: string;
  encounterDatetime: string;
  obs: CervixObservation[];
  encounterType: {
    uuid: string;
    display: string;
  };
  patient: {
    uuid: string;
  };
}

export interface SaveCervixDataResponse {
  success: boolean;
  message: string;
  encounter?: CervixEncounter;
  error?: string;
}

/**
 * Save cervix form data to OpenMRS
 */
export async function saveCervixFormData(
  patientUuid: string,
  formData: CervixFormData,
  providerUuid?: string,
  locationUuid?: string,
): Promise<SaveCervixDataResponse> {
  try {
    // Build observations from form data
    const observations = buildCervixObservations(formData);

    // Log missing fields for debugging
    const missingFields = [];
    if (!formData.hour || isNaN(parseFloat(formData.hour))) {
      missingFields.push('hour');
    }
    if (!formData.time || formData.time.trim() === '') {
      missingFields.push('time');
    }
    if (!formData.cervicalDilation || isNaN(parseFloat(formData.cervicalDilation))) {
      missingFields.push('cervicalDilation');
    }
    // Descent must be a valid number
    if (!formData.descent || isNaN(parseFloat(formData.descent))) {
      missingFields.push('descent');
    }
    if (missingFields.length > 0) {
      console.warn('Missing or invalid cervix fields:', missingFields);
      return {
        success: false,
        message: `Missing or invalid fields: ${missingFields.join(', ')}`,
        error: 'INVALID_FIELDS',
      };
    }

    // Get current session for provider/location if not provided
    const session = await getCurrentSession();
    const finalProviderUuid = providerUuid || session?.currentProvider?.uuid;
    const finalLocationUuid = locationUuid || session?.sessionLocation?.uuid;

    if (!finalProviderUuid) {
      return {
        success: false,
        message: 'Provider information is required',
        error: 'NO_PROVIDER',
      };
    }

    if (!finalLocationUuid) {
      return {
        success: false,
        message: 'Location information is required',
        error: 'NO_LOCATION',
      };
    }

    // Set encounterDatetime to 1 minute before current time to avoid future datetime error
    const now = new Date();
    now.setMinutes(now.getMinutes() - 1);
    const encounterPayload = {
      patient: patientUuid,
      encounterType: MCH_PARTOGRAPHY_ENCOUNTER_UUID,
      location: finalLocationUuid,
      encounterDatetime: toOmrsIsoString(now),
      obs: observations,
      encounterProviders: [
        {
          provider: finalProviderUuid,
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f', // Default encounter role UUID
        },
      ],
    };

    // Save encounter to OpenMRS
    const response = await openmrsFetch(`${restBaseUrl}/encounter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encounterPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to save cervix data: ${response.status} ${response.statusText}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = `Failed to save cervix data: ${errorData.error.message}`;
        }
      } catch (e) {
        // Use default error message
      }

      return {
        success: false,
        message: errorMessage,
        error: 'SAVE_FAILED',
      };
    }

    const encounter = await response.json();

    return {
      success: true,
      message: 'Cervix data saved successfully',
      encounter,
    };
  } catch (error) {
    console.error('Error saving cervix form data:', error);
    return {
      success: false,
      message: `Failed to save cervix data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'EXCEPTION',
    };
  }
}

/**
 * Build observations array from form data
 */
function buildCervixObservations(formData: CervixFormData): any[] {
  const observations = [];
  const obsDatetime = toOmrsIsoString(new Date());

  // Hour observation (send as number for numeric concept)
  if (formData.hour && formData.hour !== '') {
    const hourValue = parseFloat(formData.hour);
    if (!isNaN(hourValue)) {
      observations.push({
        concept: CERVIX_FORM_CONCEPTS.hour,
        value: hourValue,
        obsDatetime,
      });
    }
  }

  // Time observation (send as string)
  if (formData.time && formData.time !== '') {
    observations.push({
      concept: CERVIX_FORM_CONCEPTS.time,
      value: formData.time,
      obsDatetime,
    });
  }

  // Cervical dilation observation
  if (formData.cervicalDilation && formData.cervicalDilation !== '') {
    const dilationValue = parseFloat(formData.cervicalDilation);
    if (!isNaN(dilationValue)) {
      observations.push({
        concept: CERVIX_FORM_CONCEPTS.cervicalDilation,
        value: dilationValue,
        obsDatetime,
      });
    }
  }

  // Descent of head observation (save as numeric value)
  if (formData.descent && formData.descent !== '') {
    const descentValue = parseFloat(formData.descent);
    if (!isNaN(descentValue)) {
      observations.push({
        concept: CERVIX_FORM_CONCEPTS.descentOfHead,
        value: descentValue,
        obsDatetime,
      });
    }
  }

  return observations;
}

/**
 * Get current session information
 */
async function getCurrentSession() {
  try {
    const response = await openmrsFetch(`${restBaseUrl}/session`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to get current session:', error);
  }
  return null;
}

/**
 * Hook to fetch cervix data for a patient
 */
export function useCervixData(patientUuid: string) {
  const encounterRepresentation =
    'custom:(uuid,encounterDatetime,encounterType:(uuid,display),' +
    'obs:(uuid,concept:(uuid,display),value,obsDatetime,display),' +
    'patient:(uuid))';

  const url = `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=${encounterRepresentation}`;

  const { data, error, isLoading, mutate } = useSWR<{
    data: {
      results: CervixEncounter[];
    };
  }>(patientUuid ? url : null, openmrsFetch);

  // Process and transform the raw encounter data
  const cervixData = data?.data?.results || [];

  // Sort encounters by date (newest first)
  const sortedEncounters = cervixData.sort(
    (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
  );

  // Transform encounters to usable data format
  const transformedData = sortedEncounters.map((encounter) => {
    const observations = encounter.obs || [];

    // Extract specific observations by concept UUID
    const hourObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.hour);
    const timeObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.time);
    const cervicalDilationObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.cervicalDilation);
    const descentObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.descentOfHead);

    // Descent of head is now stored as a number
    let descentOfHead = null;
    if (descentObs?.value !== undefined && descentObs?.value !== null) {
      descentOfHead = Number(descentObs.value);
    }

    return {
      uuid: encounter.uuid,
      encounterDatetime: encounter.encounterDatetime,
      hour: hourObs?.value ? Number(hourObs.value) : null,
      time: timeObs?.value ? String(timeObs.value) : null,
      cervicalDilation: cervicalDilationObs?.value ? Number(cervicalDilationObs.value) : null,
      descentOfHead,
      // Combined display for easier use
      timeDisplay: timeObs?.value ? `${hourObs?.value || '??'}:${timeObs.value}` : null,
    };
  });

  // Extract arrays for easier chart integration
  const existingTimeEntries = transformedData
    .filter((data) => data.hour !== null && data.time !== null)
    .map((data) => ({ hour: data.hour!, time: data.time! }));

  const existingCervixData = transformedData
    .filter((data) => data.cervicalDilation !== null && data.descentOfHead !== null)
    .map((data) => ({
      cervicalDilation: data.cervicalDilation!,
      descentOfHead: data.descentOfHead!,
    }));

  const selectedHours = existingTimeEntries.map((entry) => entry.hour);

  return {
    encounters: sortedEncounters,
    cervixData: transformedData,
    existingTimeEntries,
    existingCervixData,
    selectedHours,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Delete a cervix encounter
 */
export async function deleteCervixEncounter(encounterUuid: string): Promise<SaveCervixDataResponse> {
  try {
    const response = await openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to delete encounter: ${response.status} ${response.statusText}`,
        error: 'DELETE_FAILED',
      };
    }

    return {
      success: true,
      message: 'Encounter deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting cervix encounter:', error);
    return {
      success: false,
      message: `Failed to delete encounter: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: 'EXCEPTION',
    };
  }
}
