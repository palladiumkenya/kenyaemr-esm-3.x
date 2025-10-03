import React from 'react';
import { openmrsFetch, restBaseUrl, toOmrsIsoString } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { MCH_PARTOGRAPHY_ENCOUNTER_UUID, PARTOGRAPHY_CONCEPTS } from '../types';
import { createPartographyEncounter } from '../partography.resource';
import { useTranslation } from 'react-i18next';

export interface DescentOfHeadEntry {
  id: string;
  uuid: string;
  encounterUuid: string;
  descentOfHead: number;
  time?: string;
  date: string;
  encounterDatetime: string;
  obsDatetime: string;
}

export function useDescentOfHeadData(patientUuid: string) {
  const { t } = useTranslation();
  const fetcher = (url: string) => openmrsFetch(url).then((res) => res.json());
  const { data, error, isLoading, mutate } = useSWR(
    patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=full&limit=100&order=desc`
      : null,
    fetcher,
  );
  const descentOfHeadData: DescentOfHeadEntry[] = React.useMemo(() => {
    if (!data?.results || !Array.isArray(data.results)) {
      return [];
    }
    const entries: DescentOfHeadEntry[] = [];
    for (const encounter of data.results) {
      if (!encounter.obs || !Array.isArray(encounter.obs)) {
        continue;
      }
      const descentObs = encounter.obs.find((obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['descent-of-head']);
      if (descentObs) {
        const encounterDatetime = new Date(encounter.encounterDatetime);
        const timeObs = encounter.obs.find(
          (obs) =>
            obs.concept.uuid === PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'] &&
            typeof obs.value === 'string' &&
            obs.value.startsWith('Time:'),
        );
        let time = '';
        if (timeObs && typeof timeObs.value === 'string') {
          const timeMatch = timeObs.value.match(/Time:\s*(.+)/);
          if (timeMatch) {
            time = timeMatch[1].trim();
          }
        }
        entries.push({
          id: `doh-${encounter.uuid}`,
          uuid: encounter.uuid,
          encounterUuid: encounter.uuid,
          descentOfHead: parseFloat(descentObs.value) || 0,
          time,
          date: encounterDatetime.toLocaleDateString(),
          encounterDatetime: encounterDatetime.toISOString(),
          obsDatetime: descentObs.obsDatetime,
        });
      }
    }
    return entries.sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime());
  }, [data]);
  let localizedError = error;
  if (error) {
    localizedError = t('Failed to load descent of head data');
  }
  return {
    descentOfHeadData,
    isLoading,
    error: localizedError,
    mutate,
  };
}

export async function saveDescentOfHeadData(
  patientUuid: string,
  formData: { descentOfHead: number; time?: string },
  t: (key: string, defaultValue?: string) => string,
  locationUuid?: string,
  providerUuid?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await createPartographyEncounter(
      patientUuid,
      'descent-of-head',
      formData,
      locationUuid,
      providerUuid,
    );
    return result;
  } catch (error) {
    return {
      success: false,
      message: error?.message || t('Failed to save descent of head data'),
    };
  }
}
