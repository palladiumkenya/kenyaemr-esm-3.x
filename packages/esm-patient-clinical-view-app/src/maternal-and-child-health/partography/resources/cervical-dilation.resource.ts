import React from 'react';
import { openmrsFetch, restBaseUrl, toOmrsIsoString } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { MCH_PARTOGRAPHY_ENCOUNTER_UUID, PARTOGRAPHY_CONCEPTS } from '../types';
import { createPartographyEncounter } from '../partography.resource';
import { useTranslation } from 'react-i18next';

export interface CervicalDilationEntry {
  id: string;
  uuid: string;
  encounterUuid: string;
  cervicalDilation: number;
  amnioticFluid?: string;
  moulding?: string;
  time?: string;
  date: string;
  encounterDatetime: string;
  obsDatetime: string;
}

export function useCervicalDilationData(patientUuid: string) {
  const fetcher = (url: string) => openmrsFetch(url).then((res) => res.json());
  const { data, error, isLoading, mutate } = useSWR(
    patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=full&limit=100&order=desc`
      : null,
    fetcher,
    {
      onError: () => {},
    },
  );
  const cervicalDilationData: CervicalDilationEntry[] = React.useMemo(() => {
    if (!data?.results || !Array.isArray(data.results)) {
      return [];
    }
    const entries: CervicalDilationEntry[] = [];
    for (const encounter of data.results) {
      if (!encounter.obs || !Array.isArray(encounter.obs)) {
        continue;
      }
      const cervicalDilationObs = encounter.obs.find(
        (obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['cervical-dilation'],
      );
      if (cervicalDilationObs) {
        const encounterDatetime = new Date(encounter.encounterDatetime);
        const amnioticFluidObs = encounter.obs.find(
          (obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['amniotic-fluid'],
        );
        const mouldingObs = encounter.obs.find((obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['moulding']);
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
          id: `cd-${encounter.uuid}`,
          uuid: encounter.uuid,
          encounterUuid: encounter.uuid,
          cervicalDilation: parseFloat(cervicalDilationObs.value) || 0,
          amnioticFluid: amnioticFluidObs?.value || '',
          moulding: mouldingObs?.value || '',
          time,
          date: encounterDatetime.toLocaleDateString(),
          encounterDatetime: encounterDatetime.toISOString(),
          obsDatetime: cervicalDilationObs.obsDatetime,
        });
      }
    }
    return entries.sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime());
  }, [data]);
  return {
    cervicalDilationData,
    isLoading,
    error,
    mutate,
  };
}

export async function saveCervicalDilationData(
  patientUuid: string,
  formData: { cervicalDilation: number; amnioticFluid?: string; moulding?: string; time?: string },
  t: (key: string, defaultValue?: string) => string,
  locationUuid?: string,
  providerUuid?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await createPartographyEncounter(
      patientUuid,
      'cervical-dilation',
      formData,
      locationUuid,
      providerUuid,
    );
    return result;
  } catch (error) {
    return {
      success: false,
      message: error?.message || t('Failed to save cervical dilation data'),
    };
  }
}
