import { openmrsFetch, restBaseUrl, toOmrsIsoString } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { MCH_PARTOGRAPHY_ENCOUNTER_UUID } from '../forms/useCervixData';
import { ENCOUNTER_ROLE } from '../../../config-schema';
import { OXYTOCIN_FORM_CONCEPTS } from '../types';

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
 * Helper function to extract time from oxytocin observation value
 */
function extractTimeFromOxytocinObs(obsValue: any): string {
  if (!obsValue) {
    return '';
  }

  if (typeof obsValue === 'string') {
    // Handle "Time: HH:MM" format
    if (obsValue.startsWith('Time:')) {
      const match = obsValue.match(/Time:\s*(.+)/);
      if (match) {
        const time = match[1].trim();
        // Validate HH:MM format
        if (time.match(/^\d{1,2}:\d{2}$/)) {
          return time;
        }
      }
    }
    // Handle direct HH:MM format
    if (obsValue.match(/^\d{1,2}:\d{2}$/)) {
      return obsValue;
    }
  } else if (typeof obsValue === 'object' && obsValue && 'display' in obsValue) {
    // Handle concept object with display property
    return extractTimeFromOxytocinObs(obsValue.display);
  }

  return '';
}

export function useOxytocinData(patientUuid: string) {
  const { t } = useTranslation();
  const encounterRepresentation =
    'custom:(uuid,encounterDatetime,encounterType:(uuid,display),' +
    'obs:(uuid,concept:(uuid,display),value,obsDatetime,display),' +
    'patient:(uuid))';

  const url = `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=${encounterRepresentation}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: { results: any[] } }>(
    patientUuid ? url : null,
    openmrsFetch,
  );
  const oxytocinData = data?.data?.results || [];
  const sortedEncounters = oxytocinData.sort(
    (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
  );
  const transformedData = sortedEncounters
    .map((encounter) => {
      const observations = encounter.obs || [];
      const timeObs = observations.find((obs) => obs.concept.uuid === OXYTOCIN_FORM_CONCEPTS.time);
      const dropsObs = observations.find((obs) => obs.concept.uuid === OXYTOCIN_FORM_CONCEPTS.oxytocinDropsPerMinute);

      // Only include encounters that have both time and drops data (indicating genuine oxytocin form submissions)
      if (!timeObs?.value || !dropsObs?.value) {
        return null;
      }

      const timeValue = String(timeObs.value);
      const dropsValue = Number(dropsObs.value);

      // Additional validation: ensure the time value looks like oxytocin form data
      const extractedTime = extractTimeFromOxytocinObs(timeValue);
      if (!extractedTime || !extractedTime.match(/^\d{1,2}:\d{2}$/)) {
        return null;
      }

      // Ensure drops per minute is a valid number
      if (isNaN(dropsValue) || dropsValue < 0) {
        return null;
      }

      return {
        uuid: encounter.uuid,
        encounterDatetime: encounter.encounterDatetime,
        time: timeValue,
        dropsPerMinute: dropsValue,
        timeDisplay: extractedTime,
      };
    })
    .filter(Boolean) as Array<{
    uuid: string;
    encounterDatetime: string;
    time: string;
    dropsPerMinute: number;
    timeDisplay: string;
  }>;

  const existingOxytocinEntries = transformedData.map((data) => ({
    time: data.time,
    dropsPerMinute: data.dropsPerMinute,
  }));

  let localizedError = error;
  if (error) {
    localizedError = t('Failed to load oxytocin data');
  }

  // Transform data for TimePickerDropdown component (format: Array<{ hour: number; time: string }>)
  const existingTimeEntries = transformedData.map((data) => {
    const timeStr = data.timeDisplay; // Already extracted and validated above
    const [hours] = timeStr.split(':').map(Number);
    return {
      hour: hours,
      time: timeStr,
    };
  });

  return {
    encounters: sortedEncounters,
    oxytocinData: transformedData,
    existingOxytocinEntries,
    existingTimeEntries, // For TimePickerDropdown component
    isLoading,
    error: localizedError,
    mutate,
  };
}

export async function saveOxytocinFormData(
  patientUuid: string,
  formData: OxytocinFormData,
  t: (key: string, defaultValue?: string, options?: any) => string,
  providerUuid?: string,
  locationUuid?: string,
): Promise<SaveOxytocinDataResponse> {
  const observations = buildOxytocinObservations(formData);
  const missingFields = [];
  if (!formData.time || formData.time.trim() === '') {
    missingFields.push('time');
  }
  if (!formData.dropsPerMinute || isNaN(parseFloat(formData.dropsPerMinute))) {
    missingFields.push('dropsPerMinute');
  }
  if (missingFields.length > 0) {
    return {
      success: false,
      message: t(`Missing or invalid fields: ${missingFields.join(', ')}`),
      error: 'INVALID_FIELDS',
    };
  }
  const session = await getCurrentSession();
  const finalProviderUuid = providerUuid || session?.currentProvider?.uuid;
  const finalLocationUuid = locationUuid || session?.sessionLocation?.uuid;
  if (!finalProviderUuid) {
    return { success: false, message: t('Provider information is required'), error: 'NO_PROVIDER' };
  }
  if (!finalLocationUuid) {
    return { success: false, message: t('Location information is required'), error: 'NO_LOCATION' };
  }
  // Use utility to ensure encounterDatetime is always in the past
  // Import getValidEncounterDatetime from types/index if not already imported
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getValidEncounterDatetime } = require('../types');
  const encounterPayload = {
    patient: patientUuid,
    encounterType: MCH_PARTOGRAPHY_ENCOUNTER_UUID,
    location: finalLocationUuid,
    encounterDatetime: getValidEncounterDatetime(),
    obs: observations,
    encounterProviders: [
      {
        provider: finalProviderUuid,
        encounterRole: ENCOUNTER_ROLE,
      },
    ],
  };
  const response = await openmrsFetch(`${restBaseUrl}/encounter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encounterPayload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = t(`Failed to save oxytocin data: ${response.status} ${response.statusText}`);
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorMessage = t(`Failed to save oxytocin data: ${errorData.error.message}`);
      }
    } catch (e) {}
    return { success: false, message: errorMessage, error: 'SAVE_FAILED' };
  }
  const encounter = await response.json();
  return { success: true, message: t('Oxytocin data saved successfully'), encounter };
}

function buildOxytocinObservations(formData: OxytocinFormData): any[] {
  const observations = [];
  const obsDatetime = toOmrsIsoString(new Date());
  if (formData.time && formData.time !== '') {
    observations.push({ concept: OXYTOCIN_FORM_CONCEPTS.time, value: formData.time, obsDatetime });
  }
  if (formData.dropsPerMinute && formData.dropsPerMinute !== '') {
    const dropsValue = parseFloat(formData.dropsPerMinute);
    if (!isNaN(dropsValue)) {
      observations.push({ concept: OXYTOCIN_FORM_CONCEPTS.oxytocinDropsPerMinute, value: dropsValue, obsDatetime });
    }
  }
  return observations;
}

async function getCurrentSession() {
  try {
    const response = await openmrsFetch(`${restBaseUrl}/session`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Swallow error silently
  }
  return null;
}
