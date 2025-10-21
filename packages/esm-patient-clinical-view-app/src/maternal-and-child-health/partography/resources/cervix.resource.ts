import { openmrsFetch, restBaseUrl, toOmrsIsoString } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
export { MCH_PARTOGRAPHY_ENCOUNTER_UUID } from '../types';
import { CERVIX_FORM_CONCEPTS, MCH_PARTOGRAPHY_ENCOUNTER_UUID } from '../types';
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
      observations.push({ concept: CERVIX_FORM_CONCEPTS.descentOfHead, value: descentValue, obsDatetime });
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
    const hourObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.hour);
    const timeObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.time);
    const cervicalDilationObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.cervicalDilation);
    const descentObs = observations.find((obs) => obs.concept.uuid === CERVIX_FORM_CONCEPTS.descentOfHead);
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
