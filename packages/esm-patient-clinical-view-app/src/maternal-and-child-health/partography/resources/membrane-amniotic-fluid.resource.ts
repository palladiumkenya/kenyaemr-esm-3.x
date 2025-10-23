import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { PARTOGRAPHY_CONCEPTS, MCH_PARTOGRAPHY_ENCOUNTER_UUID } from '../types';
import { createPartographyEncounter } from '../partography.resource';
import { useTranslation } from 'react-i18next';

export function useMembraneAmnioticFluidData(patientUuid: string) {
  const { t } = useTranslation();
  const fetcher = (url: string) => openmrsFetch(url).then((res) => res.json());

  const { data, error, isLoading, mutate } = useSWR(
    patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=full&limit=100&order=desc`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const membraneAmnioticFluidEntries = useMemo(() => {
    if (!data?.results || !Array.isArray(data.results)) {
      return [];
    }

    const entries = [];
    for (const encounter of data.results) {
      if (!encounter.obs || !Array.isArray(encounter.obs)) {
        continue;
      }

      const amnioticFluidObs = encounter.obs.find((obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['amniotic-fluid']);
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

      if (amnioticFluidObs || mouldingObs) {
        entries.push({
          id: `maf-${encounter.uuid}`,
          uuid: encounter.uuid,
          amnioticFluid: amnioticFluidObs?.value?.display || amnioticFluidObs?.value || '',
          moulding: mouldingObs?.value?.display || mouldingObs?.value || '',
          time,
          date: new Date(encounter.encounterDatetime).toLocaleDateString(),
          encounterDatetime: encounter.encounterDatetime,
        });
      }
    }
    return entries;
  }, [data]);

  let localizedError = error;
  if (error) {
    localizedError = t('Failed to load membrane amniotic fluid data');
  }

  return {
    membraneAmnioticFluidEntries,
    isLoading,
    error: localizedError,
    mutate,
  };
}

export async function saveMembraneAmnioticFluidData(
  patientUuid: string,
  formData: { amnioticFluid: string; moulding: string; time: string },
  t: (key: string, defaultValue?: string, options?: any) => string,
  locationUuid?: string,
  providerUuid?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await createPartographyEncounter(
      patientUuid,
      'membrane-amniotic-fluid',
      formData,
      locationUuid,
      providerUuid,
    );
    if (result?.success && result?.encounter) {
      return result;
    } else {
      return {
        success: false,
        message: result?.message || t('Failed to save membrane amniotic fluid data'),
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error?.message || t('Failed to save membrane amniotic fluid data'),
    };
  }
}
