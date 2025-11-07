import React from 'react';
import { openmrsFetch, restBaseUrl, toOmrsIsoString } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { MCH_PARTOGRAPHY_ENCOUNTER_UUID, PARTOGRAPHY_CONCEPTS } from '../types';
import { createPartographyEncounter } from '../partography.resource';
import { useTranslation } from 'react-i18next';
import { FETAL_HEART_RATE_HOUR_CONCEPT } from '../../../config-schema';

export interface FetalHeartRateEntry {
  id: string;
  uuid: string;
  encounterUuid: string;
  fetalHeartRate: number;
  hour: number;
  time: string;
  date: string;
  encounterDatetime: string;
  obsDatetime: string;
}

export function useFetalHeartRateData(patientUuid: string) {
  const { t } = useTranslation();
  const fetcher = (url: string) => openmrsFetch(url).then((res) => res.json());
  const { data, error, isLoading, mutate } = useSWR(
    patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=full&limit=100&order=desc`
      : null,
    fetcher,
  );
  const fetalHeartRateData: FetalHeartRateEntry[] = React.useMemo(() => {
    if (!data?.results || !Array.isArray(data.results)) {
      return [];
    }
    const fetalHeartRateEntries: FetalHeartRateEntry[] = [];
    for (const encounter of data.results) {
      if (!encounter.obs || !Array.isArray(encounter.obs)) {
        continue;
      }
      const fetalHeartRateObs = encounter.obs.find(
        (obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['fetal-heart-rate'],
      );
      if (fetalHeartRateObs) {
        const encounterDatetime = new Date(encounter.encounterDatetime);
        let hour = 0;
        let time = '';
        // Find hour obs by concept and use its value as number
        const hourObs = encounter.obs.find(
          (obs) => obs.concept.uuid === FETAL_HEART_RATE_HOUR_CONCEPT && typeof obs.value === 'number',
        );
        const timeObs = encounter.obs.find(
          (obs) =>
            obs.concept.uuid === PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'] &&
            obs.value &&
            typeof obs.value === 'string' &&
            obs.value.startsWith('Time:'),
        );
        if (hourObs && typeof hourObs.value === 'number') {
          hour = hourObs.value;
        }
        if (timeObs && typeof timeObs.value === 'string') {
          const timeMatch = timeObs.value.match(/Time:\s*(.+)/);
          if (timeMatch) {
            time = timeMatch[1].trim();
          }
        }
        fetalHeartRateEntries.push({
          id: `fhr-${fetalHeartRateObs.uuid}`,
          uuid: fetalHeartRateObs.uuid,
          encounterUuid: encounter.uuid,
          fetalHeartRate: parseFloat(fetalHeartRateObs.value) || 0,
          hour,
          time,
          date: encounterDatetime.toLocaleDateString(),
          encounterDatetime: encounterDatetime.toISOString(),
          obsDatetime: fetalHeartRateObs.obsDatetime,
        });
      }
    }
    return fetalHeartRateEntries.sort(
      (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
    );
  }, [data]);
  let localizedError = error;
  if (error) {
    localizedError = t('Failed to load fetal heart rate data');
  }
  return {
    fetalHeartRateData,
    isLoading,
    error: localizedError,
    mutate,
  };
}

export async function saveFetalHeartRateData(
  patientUuid: string,
  formData: { hour: number; time: string; fetalHeartRate: number },
  t: (key: string, defaultValue?: string, options?: any) => string,
  locationUuid?: string,
  providerUuid?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await createPartographyEncounter(
      patientUuid,
      'fetal-heart-rate',
      formData,
      locationUuid,
      providerUuid,
    );
    return result;
  } catch (error) {
    return {
      success: false,
      message: error?.message || t('Failed to save fetal heart rate data'),
    };
  }
}
