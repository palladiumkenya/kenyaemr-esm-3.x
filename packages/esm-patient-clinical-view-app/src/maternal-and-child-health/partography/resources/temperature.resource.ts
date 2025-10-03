import useSWR from 'swr';
import { usePartographyEncounters } from '../partography.resource';
import { useTranslation } from 'react-i18next';

export function useTemperatureData(patientUuid: string) {
  const { encounters, isLoading, error, mutate } = usePartographyEncounters(patientUuid, 'temperature');
  return { data: encounters, isLoading, error, mutate };
}

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
