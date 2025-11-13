import useSWR from 'swr';
import { usePartographyEncounters, usePartographyData } from '../partography.resource';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export function useTemperatureData(patientUuid: string) {
  const { encounters, isLoading, error, mutate } = usePartographyEncounters(patientUuid, 'temperature');
  return { data: encounters, isLoading, error, mutate };
}

export interface TemperatureTimeEntry {
  hour: number;
  time: string;
  encounterDatetime: string;
  temperature?: number;
}

export interface UseTemperatureFormDataResult {
  temperatureData: any[];
  temperatureTimeEntries: TemperatureTimeEntry[];
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

/**
 * Custom hook for temperature-specific data isolation
 * This ensures temperature form validations only consider temperature data
 */
export const useTemperatureFormData = (patientUuid: string): UseTemperatureFormDataResult => {
  const { data: temperatureEncounters = [], isLoading, error, mutate } = usePartographyData(patientUuid, 'temperature');

  // Extract temperature-specific time entries for form validation
  const temperatureTimeEntries = useMemo(() => {
    if (!temperatureEncounters || temperatureEncounters.length === 0) {
      return [];
    }

    return temperatureEncounters
      .map((encounter) => {
        // Find temperature observation
        const tempObs = encounter.obs.find((obs) => obs.concept.uuid === '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

        // Find time observation
        const timeObs = encounter.obs.find(
          (obs) =>
            obs.concept.uuid === '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' &&
            typeof obs.value === 'string' &&
            obs.value.startsWith('Time:'),
        );

        if (!tempObs || !timeObs) {
          return null; // Skip if no temperature or time data
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

        // Extract temperature value
        let temperature = tempObs?.value ?? null;
        if (typeof temperature === 'string') {
          const parsed = parseFloat(temperature);
          temperature = isNaN(parsed) ? null : parsed;
        }

        return {
          hour: hourValue,
          time: time,
          encounterDatetime: encounter.encounterDatetime,
          temperature: typeof temperature === 'number' ? temperature : undefined,
        };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => {
        // Sort by encounter datetime for chronological order
        return new Date(a!.encounterDatetime).getTime() - new Date(b!.encounterDatetime).getTime();
      }) as TemperatureTimeEntry[];
  }, [temperatureEncounters]);

  return {
    temperatureData: temperatureEncounters,
    temperatureTimeEntries,
    isLoading,
    error,
    mutate,
  };
};

import { PARTOGRAPHY_CONCEPTS } from '../types';
import { toOmrsIsoString } from '@openmrs/esm-framework';

export function buildTemperatureObservation(formData: any): any[] {
  const timeConfig = { defaultEncounterOffset: 0 };
  const obsDatetime = toOmrsIsoString(new Date(Date.now() - timeConfig.defaultEncounterOffset));
  const observations = [];
  const tempValue =
    formData.temperature !== undefined && formData.temperature !== null
      ? formData.temperature
      : formData.value !== undefined && formData.value !== null
      ? formData.value
      : formData.measurementValue;
  if (tempValue !== undefined && tempValue !== null && tempValue !== '') {
    observations.push({
      concept: PARTOGRAPHY_CONCEPTS['temperature'],
      value: parseFloat(tempValue),
      obsDatetime,
    });
  }
  // Add time observation if present
  const timeValue = formData.exactTime || formData.timeSlot || formData.time;
  if (timeValue) {
    observations.push({
      concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'],
      value: `Time: ${timeValue}`,
      obsDatetime,
    });
  }
  return observations;
}

export function transformTemperatureEncounterToChartData(encounters: any[]): any[] {
  const chartData = [];
  encounters.forEach((encounter) => {
    const encounterTime = new Date(encounter.encounterDatetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    encounter.obs?.forEach((obs) => {
      if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['temperature']) {
        chartData.push({
          group: 'Temperature',
          time: encounterTime,
          value: parseFloat(obs.value),
        });
      }
    });
  });
  return chartData;
}

export function transformTemperatureEncounterToTableData(encounters: any[]): any[] {
  const tableData = [];
  encounters.forEach((encounter, index) => {
    const encounterDate = new Date(encounter.encounterDatetime);
    const dateTime = `${encounterDate.toLocaleDateString()} — ${encounterDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;
    encounter.obs?.forEach((obs, obsIndex) => {
      if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['temperature']) {
        tableData.push({
          id: `temperature-${index}-${obsIndex}`,
          dateTime,
          value: parseFloat(obs.value),
          unit: '°C',
        });
      }
    });
  });
  return tableData;
}

/**
 * Helper function to convert time string to decimal hour
 * Example: "14:30" -> 14.5
 */
export const convertTimeToHour = (timeString: string): number => {
  if (!timeString || !timeString.match(/^\d{1,2}:\d{2}$/)) {
    return 0;
  }

  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + minutes / 60;
};

/**
 * Helper function to extract time from observation value
 * Handles various time formats in OpenMRS observations
 */
export const extractTimeFromTemperatureObs = (obsValue: any): string => {
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
