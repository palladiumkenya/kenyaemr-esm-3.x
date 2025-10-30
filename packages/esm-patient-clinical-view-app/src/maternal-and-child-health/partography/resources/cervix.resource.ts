export type UseCervixDataResult = ReturnType<typeof useCervixData>;
import { openmrsFetch, restBaseUrl, toOmrsIsoString } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
export { MCH_PARTOGRAPHY_ENCOUNTER_UUID } from '../types';
import { CERVIX_FORM_CONCEPTS, MCH_PARTOGRAPHY_ENCOUNTER_UUID, DESCENT_OF_HEAD_OPTIONS } from '../types';
import { ENCOUNTER_ROLE } from '../../../config-schema';

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
export async function saveCervixFormData(
  patientUuid: string,
  formData: CervixFormData,
  t: (key: string, defaultValue?: string, options?: any) => string,
  providerUuid?: string,
  locationUuid?: string,
): Promise<SaveCervixDataResponse> {
  try {
    const observations = buildCervixObservations(formData);
    const missingFields = [];
    if (!formData.hour || isNaN(parseFloat(formData.hour))) {
      missingFields.push(t('Hour'));
    }
    if (!formData.time || formData.time.trim() === '') {
      missingFields.push(t('Time'));
    }
    if (!formData.cervicalDilation || isNaN(parseFloat(formData.cervicalDilation))) {
      missingFields.push(t('Cervical Dilation'));
    }
    if (!formData.descent || isNaN(parseFloat(formData.descent))) {
      missingFields.push(t('Descent of Head'));
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
    const now = new Date();
    now.setMinutes(now.getMinutes() - 3);
    const encounterPayload = {
      patient: patientUuid,
      encounterType: MCH_PARTOGRAPHY_ENCOUNTER_UUID,
      location: finalLocationUuid,
      encounterDatetime: toOmrsIsoString(now),
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
      let errorMessage = t(`Failed to save cervix data: ${response.status} ${response.statusText}`);
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = t(`Failed to save cervix data: ${errorData.error.message}`);
        }
      } catch (e) {}
      return { success: false, message: errorMessage, error: 'SAVE_FAILED' };
    }
    const encounter = await response.json();
    return { success: true, message: t('Cervix data saved successfully'), encounter };
  } catch (error) {
    return {
      success: false,
      message: t(`Failed to save cervix data: ${error instanceof Error ? error.message : t('Unknown error')}`),
      error: 'EXCEPTION',
    };
  }
}

function buildCervixObservations(formData: CervixFormData): any[] {
  const observations = [];
  const obsDatetime = toOmrsIsoString(new Date());
  // Save hour as a number (not string)
  if (formData.hour && formData.hour !== '') {
    const hourValue = parseFloat(formData.hour);
    if (!isNaN(hourValue)) {
      observations.push({ concept: CERVIX_FORM_CONCEPTS.hour, value: hourValue, obsDatetime });
    }
  }
  // Always save time as 'Time: HH:mm' string
  if (formData.time && formData.time !== '') {
    // If already prefixed, don't double-prefix
    const timeValue = formData.time.startsWith('Time:') ? formData.time : `Time: ${formData.time}`;
    observations.push({ concept: CERVIX_FORM_CONCEPTS.time, value: timeValue, obsDatetime });
  }
  if (formData.cervicalDilation && formData.cervicalDilation !== '') {
    const dilationValue = parseFloat(formData.cervicalDilation);
    if (!isNaN(dilationValue)) {
      observations.push({ concept: CERVIX_FORM_CONCEPTS.cervicalDilation, value: dilationValue, obsDatetime });
    }
  }
  if (formData.descent && formData.descent !== '') {
    const descentValue = parseFloat(formData.descent);
    if (!isNaN(descentValue)) {
      const matchingOption = DESCENT_OF_HEAD_OPTIONS.find((opt) => opt.stationValue === descentValue);
      if (matchingOption && matchingOption.value) {
        observations.push({ concept: CERVIX_FORM_CONCEPTS.descentOfHead, value: matchingOption.value, obsDatetime });
      } else {
        observations.push({ concept: CERVIX_FORM_CONCEPTS.descentOfHead, value: descentValue, obsDatetime });
      }
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
    // Swallow error
  }
  return null;
}

export function useCervixData(patientUuid: string) {
  // No comments, no logs
  const encounterRepresentation =
    'custom:(uuid,encounterDatetime,encounterType:(uuid,display),' +
    'obs:(uuid,concept:(uuid,display),value,obsDatetime,display),' +
    'patient:(uuid))';
  const url = `/ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=${encounterRepresentation}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: { results: CervixEncounter[] } }>(
    patientUuid ? url : null,
    openmrsFetch,
  );
  const cervixData = data?.data?.results || [];
  const sortedEncounters = cervixData.sort(
    (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
  );
  const transformedData = sortedEncounters.map((encounter) => {
    const observations = encounter.obs || [];

    // Fix: extract hour and time from all obs with the same concept UUID by value prefix
    let hourObs = observations.find(
      (obs) =>
        obs.concept?.uuid === CERVIX_FORM_CONCEPTS.hour &&
        typeof obs.value === 'string' &&
        obs.value.startsWith('Hour:'),
    );
    let timeObs = observations.find(
      (obs) =>
        obs.concept?.uuid === CERVIX_FORM_CONCEPTS.time &&
        typeof obs.value === 'string' &&
        obs.value.startsWith('Time:'),
    );
    // fallback: if not found by prefix, just get the first for each
    if (!hourObs) {
      hourObs = observations.find((obs) => obs.concept?.uuid === CERVIX_FORM_CONCEPTS.hour);
    }
    if (!timeObs) {
      timeObs = observations.find((obs) => obs.concept?.uuid === CERVIX_FORM_CONCEPTS.time);
    }

    let cervicalDilationObs = observations.find((obs) => obs.concept?.uuid === CERVIX_FORM_CONCEPTS.cervicalDilation);
    let descentObs = observations.find((obs) => obs.concept?.uuid === CERVIX_FORM_CONCEPTS.descentOfHead);

    let hour: number | null = null;
    if (hourObs && hourObs.value !== undefined && hourObs.value !== null) {
      if (typeof hourObs.value === 'string') {
        const match = hourObs.value.match(/Hour:\s*([0-9]+(?:\.[0-9]+)?)/);
        if (match) {
          hour = Number(match[1]);
        } else if (/^\d{1,2}(?:\.\d+)?$/.test(hourObs.value)) {
          hour = Number(hourObs.value);
        }
      } else if (typeof hourObs.value === 'number') {
        hour = hourObs.value;
      }
    }

    // Parse time from 'Time: HH:mm' or fallback to string
    let time = null;
    if (timeObs && timeObs.value !== undefined && timeObs.value !== null) {
      if (typeof timeObs.value === 'string') {
        const match = timeObs.value.match(/Time:\s*([0-9]{2}:[0-9]{2})/);
        if (match) {
          time = match[1];
        } else if (/^\d{1,2}:\d{2}$/.test(timeObs.value)) {
          time = timeObs.value;
        }
      } else {
        time = String(timeObs.value);
      }
    }

    // Cervical dilation
    let cervicalDilation = null;
    if (cervicalDilationObs && cervicalDilationObs.value !== undefined && cervicalDilationObs.value !== null) {
      if (typeof cervicalDilationObs.value === 'string') {
        const parsed = Number(cervicalDilationObs.value);
        cervicalDilation = !isNaN(parsed) ? parsed : null;
      } else if (typeof cervicalDilationObs.value === 'number') {
        cervicalDilation = cervicalDilationObs.value;
      }
    }

    // Descent of head (existing logic)
    let descentOfHead = null;
    if (descentObs?.value !== undefined && descentObs?.value !== null) {
      const val = descentObs.value;
      if (typeof val === 'number') {
        descentOfHead = val;
      } else if (typeof val === 'string') {
        const match = DESCENT_OF_HEAD_OPTIONS.find((opt) => opt.value === val || opt.conceptUuid === val);
        if (match && typeof match.stationValue === 'number') {
          descentOfHead = match.stationValue;
        } else {
          const parsed = Number(val);
          if (!isNaN(parsed)) {
            descentOfHead = parsed;
          } else {
            console.warn('[Cervix] descentOfHead unmapped value:', val, '-> fallback to 5');
            descentOfHead = 5;
          }
        }
      } else if (typeof val === 'object' && val !== null) {
        const uuid = (val as any).uuid || (val as any).value || null;
        if (uuid) {
          const match = DESCENT_OF_HEAD_OPTIONS.find((opt) => opt.value === uuid || opt.conceptUuid === uuid);
          if (match && typeof match.stationValue === 'number') {
            descentOfHead = match.stationValue;
          } else {
            console.warn('[Cervix] descentOfHead unmapped object value:', uuid, '-> fallback to 5');
            descentOfHead = 5;
          }
        }
      }
    }
    if (descentOfHead === null || isNaN(descentOfHead)) {
      console.warn('[Cervix] descentOfHead was null/NaN after all mapping, fallback to 5');
      descentOfHead = 5;
    }

    // Human-friendly label for descent
    let descentLabel: string | null = null;
    if (descentObs && descentObs.value !== undefined && descentObs.value !== null) {
      const val = descentObs.value;
      if (typeof val === 'string') {
        const match = DESCENT_OF_HEAD_OPTIONS.find((opt) => opt.value === val || opt.conceptUuid === val);
        if (match) {
          descentLabel = match.text;
        }
      }
      if (!descentLabel && typeof descentOfHead === 'number') {
        descentLabel = String(descentOfHead);
      }
    }

    return {
      uuid: encounter.uuid,
      encounterDatetime: encounter.encounterDatetime,
      hour,
      time,
      cervicalDilation,
      descentOfHead,
      descentLabel,
      timeDisplay: time ? `${hour !== null ? hour : '??'}:${time}` : null,
    };
  });
  const existingTimeEntries = transformedData
    .filter((data) => data.hour !== null && data.time !== null)
    .map((data) => ({ hour: data.hour!, time: data.time! }));
  const existingCervixData = transformedData
    .filter((data) => data.cervicalDilation !== null && data.descentOfHead !== null)
    .map((data) => ({ cervicalDilation: data.cervicalDilation!, descentOfHead: data.descentOfHead! }));
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

export async function deleteCervixEncounter(encounterUuid: string): Promise<SaveCervixDataResponse> {
  const { t } = require('react-i18next');
  try {
    const response = await openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      return {
        success: false,
        message: t('Failed to delete encounter: {{status}} {{statusText}}', {
          status: response.status,
          statusText: response.statusText,
        }),
        error: 'DELETE_FAILED',
      };
    }
    return { success: true, message: t('Encounter deleted successfully') };
  } catch (error) {
    return {
      success: false,
      message: t('Failed to delete encounter: {{message}}', {
        message: error instanceof Error ? error.message : t('Unknown error'),
      }),
      error: 'EXCEPTION',
    };
  }
}
