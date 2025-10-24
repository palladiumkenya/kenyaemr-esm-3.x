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
  if (formData.hour && formData.hour !== '') {
    const hourValue = parseFloat(formData.hour);
    if (!isNaN(hourValue)) {
      observations.push({ concept: CERVIX_FORM_CONCEPTS.hour, value: hourValue, obsDatetime });
    }
  }
  if (formData.time && formData.time !== '') {
    observations.push({ concept: CERVIX_FORM_CONCEPTS.time, value: formData.time, obsDatetime });
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
      // The descent of head is represented in the system as a coded concept
      // where each station (1..5) maps to an answer concept UUID. The UI
      // currently provides numeric station values (1..5), so convert that
      // into the appropriate concept UUID before sending the obs. If we
      // can't find a mapping, fall back to sending the numeric value.
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

    // Helper: try exact concept match first
    const byConcept = (uuid: string) => observations.find((obs) => obs.concept?.uuid === uuid);

    let hourObs = byConcept(CERVIX_FORM_CONCEPTS.hour);
    let timeObs = byConcept(CERVIX_FORM_CONCEPTS.time);
    let cervicalDilationObs = byConcept(CERVIX_FORM_CONCEPTS.cervicalDilation);
    let descentObs = byConcept(CERVIX_FORM_CONCEPTS.descentOfHead);

    // If any primary obs were not found, attempt heuristics based on value shapes
    const unused = new Set(observations);
    if (!hourObs) {
      hourObs = observations.find((o) => {
        const v = o.value;
        if (typeof v === 'number') {
          return v >= 0 && v <= 23;
        }
        if (typeof v === 'string' && /^\d{1,2}$/.test(v)) {
          return Number(v) >= 0 && Number(v) <= 23;
        }
        return false;
      });
    }

    if (!timeObs) {
      timeObs = observations.find((o) => typeof o.value === 'string' && /^\d{1,2}:\d{2}$/.test(o.value));
    }

    if (!cervicalDilationObs) {
      cervicalDilationObs = observations.find((o) => {
        const v = o.value;
        if (typeof v === 'number') {
          return v >= 0 && v <= 10;
        }
        if (typeof v === 'string' && !/^\d{1,2}:\d{2}$/.test(v)) {
          const parsed = Number(v);
          return !isNaN(parsed) && parsed >= 0 && parsed <= 10;
        }
        return false;
      });
    }

    if (!descentObs) {
      // descent might be numeric 1-5, a numeric string, or a coded answer (uuid string)
      descentObs = observations.find((o) => {
        const v = o.value;
        if (typeof v === 'number') {
          return v >= 1 && v <= 5;
        }
        if (typeof v === 'string') {
          if (/^\d{1,2}$/.test(v)) {
            return Number(v) >= 1 && Number(v) <= 5;
          }
          // likely a UUID (coded answer)
          if (/^[0-9a-fA-F-]{8,}$/.test(v)) {
            return true;
          }
        }
        if (typeof v === 'object' && v !== null && ((v as any).uuid || (v as any).display)) {
          return true;
        }
        return false;
      });
    }

    // Normalize descentOfHead to numeric station where possible
    let descentOfHead = null;
    if (descentObs?.value !== undefined && descentObs?.value !== null) {
      const val = descentObs.value;
      if (typeof val === 'number') {
        descentOfHead = val;
      } else if (typeof val === 'string') {
        // If the server returned a coded answer (concept UUID) for descent
        // map it back to the numeric station value using DESCENT_OF_HEAD_OPTIONS.
        const match = DESCENT_OF_HEAD_OPTIONS.find((opt) => opt.value === val || opt.conceptUuid === val);
        if (match && typeof match.stationValue === 'number') {
          descentOfHead = match.stationValue;
        } else {
          // Fallback: try parsing numeric string
          const parsed = Number(val);
          descentOfHead = isNaN(parsed) ? null : parsed;
        }
      } else if (typeof val === 'object' && val !== null) {
        const uuid = (val as any).uuid || (val as any).value || null;
        if (uuid) {
          const match = DESCENT_OF_HEAD_OPTIONS.find((opt) => opt.value === uuid || opt.conceptUuid === uuid);
          if (match && typeof match.stationValue === 'number') {
            descentOfHead = match.stationValue;
          }
        }
      }
    }

    // Also compute a human-friendly label for descent (when server returns
    // a coded answer UUID we map it to the option's text). Keep numeric
    // `descentOfHead` for charting but expose `descentLabel` for tables/UI.
    let descentLabel: string | null = null;
    if (descentObs && descentObs.value !== undefined && descentObs.value !== null) {
      const val = descentObs.value;
      if (typeof val === 'string') {
        const match = DESCENT_OF_HEAD_OPTIONS.find((opt) => opt.value === val || opt.conceptUuid === val);
        if (match) {
          descentLabel = match.text;
        }
      }
      // if no label found and we have a numeric station, use that
      if (!descentLabel && typeof descentOfHead === 'number') {
        descentLabel = String(descentOfHead);
      }
    }

    return {
      uuid: encounter.uuid,
      encounterDatetime: encounter.encounterDatetime,
      hour: hourObs?.value !== undefined && hourObs?.value !== null ? Number(hourObs.value) : null,
      time: timeObs?.value !== undefined && timeObs?.value !== null ? String(timeObs.value) : null,
      cervicalDilation:
        cervicalDilationObs?.value !== undefined && cervicalDilationObs?.value !== null
          ? Number(cervicalDilationObs.value)
          : null,
      descentOfHead,
      descentLabel,
      timeDisplay: timeObs?.value ? `${hourObs?.value || '??'}:${timeObs.value}` : null,
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
