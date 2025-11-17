import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { PARTOGRAPHY_CONCEPTS, MCH_PARTOGRAPHY_ENCOUNTER_UUID } from '../types';
import { createPartographyEncounter, usePartographyData } from '../partography.resource';
import { useTranslation } from 'react-i18next';

export interface MembraneAmnioticFluidTimeEntry {
  hour: number;
  time: string;
  timeSlot: string;
  encounterDatetime: string;
  amnioticFluid?: string;
  moulding?: string;
}

export interface UseMembraneAmnioticFluidFormDataResult {
  membraneAmnioticFluidData: any[];
  membraneAmnioticFluidTimeEntries: MembraneAmnioticFluidTimeEntry[];
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

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

/**
 * Custom hook for membrane amniotic fluid form-specific data isolation
 * This ensures membrane amniotic fluid form validations only consider membrane amniotic fluid data
 */
export const useMembraneAmnioticFluidFormData = (patientUuid: string): UseMembraneAmnioticFluidFormDataResult => {
  const {
    data: membraneAmnioticFluidEncounters = [],
    isLoading,
    error,
    mutate,
  } = usePartographyData(patientUuid, 'membrane-amniotic-fluid');

  // Extract membrane amniotic fluid-specific time entries for form validation
  const membraneAmnioticFluidTimeEntries = useMemo(() => {
    if (!membraneAmnioticFluidEncounters || membraneAmnioticFluidEncounters.length === 0) {
      return [];
    }

    return membraneAmnioticFluidEncounters
      .map((encounter) => {
        // Find amniotic fluid observation
        const amnioticFluidObs = encounter.obs.find(
          (obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['amniotic-fluid'],
        );

        // Find moulding observation
        const mouldingObs = encounter.obs.find((obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['moulding']);

        // Find time observation
        const timeObs = encounter.obs.find(
          (obs) =>
            obs.concept.uuid === PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'] &&
            typeof obs.value === 'string' &&
            obs.value.startsWith('Time:'),
        );

        if (!amnioticFluidObs && !mouldingObs) {
          return null; // Skip if no membrane amniotic fluid data
        }

        // Extract time from observation value
        let time = '';
        if (timeObs && typeof timeObs.value === 'string') {
          const timeMatch = timeObs.value.match(/Time:\s*(.+)/);
          if (timeMatch) {
            time = timeMatch[1].trim();
          }
        }

        if (!time || !time.match(/^\d{1,2}:\d{2}$/)) {
          return null; // Skip if invalid time format
        }

        // Convert time to hour value for progressive validation
        const [hours, minutes] = time.split(':').map(Number);
        const hourValue = hours + minutes / 60; // Convert to decimal hour

        // Create timeSlot from hour (for backward compatibility with existing form logic)
        const timeSlot = hourValue.toString();

        // Extract amniotic fluid value
        let amnioticFluid: string | undefined;
        if (amnioticFluidObs?.value) {
          if (
            typeof amnioticFluidObs.value === 'object' &&
            amnioticFluidObs.value &&
            'display' in amnioticFluidObs.value
          ) {
            amnioticFluid = (amnioticFluidObs.value as any).display;
          } else {
            amnioticFluid = String(amnioticFluidObs.value);
          }
        }

        // Extract moulding value
        let moulding: string | undefined;
        if (mouldingObs?.value) {
          if (typeof mouldingObs.value === 'object' && mouldingObs.value && 'display' in mouldingObs.value) {
            moulding = (mouldingObs.value as any).display;
          } else {
            moulding = String(mouldingObs.value);
          }
        }

        return {
          hour: hourValue,
          time: time,
          timeSlot: timeSlot,
          encounterDatetime: encounter.encounterDatetime,
          amnioticFluid,
          moulding,
        };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => {
        // Sort by encounter datetime for chronological order
        return new Date(a!.encounterDatetime).getTime() - new Date(b!.encounterDatetime).getTime();
      }) as MembraneAmnioticFluidTimeEntry[];
  }, [membraneAmnioticFluidEncounters]);

  return {
    membraneAmnioticFluidData: membraneAmnioticFluidEncounters,
    membraneAmnioticFluidTimeEntries,
    isLoading,
    error,
    mutate,
  };
};

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

/**
 * Helper function to convert time string to decimal hour
 * Example: "14:30" -> 14.5
 */
export const convertMembraneTimeToHour = (timeString: string): number => {
  if (!timeString || !timeString.match(/^\d{1,2}:\d{2}$/)) {
    return 0;
  }

  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + minutes / 60;
};

/**
 * Helper function to extract time from membrane amniotic fluid observation value
 */
export const extractTimeFromMembraneObs = (obsValue: any): string => {
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
  }

  return '';
};
