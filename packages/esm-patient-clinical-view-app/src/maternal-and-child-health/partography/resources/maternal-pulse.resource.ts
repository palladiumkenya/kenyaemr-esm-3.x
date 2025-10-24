import { useTranslation } from 'react-i18next';
import { usePartographyEncounters } from '../partography.resource';
import { PARTOGRAPHY_CONCEPTS } from '../types';
import { toOmrsIsoString } from '@openmrs/esm-framework';

export function transformMaternalPulseEncounterToChartData(
  encounters: any[],
  t: (key: string, defaultValue?: string, options?: any) => string,
): any[] {
  const chartData = [];
  encounters.forEach((encounter) => {
    const encounterTime = new Date(encounter.encounterDatetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    encounter.obs?.forEach((obs) => {
      if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['maternal-pulse']) {
        chartData.push({ group: t('Maternal Pulse'), time: encounterTime, value: parseFloat(obs.value) });
      }
    });
  });
  return chartData;
}

export function transformMaternalPulseEncounterToTableData(
  encounters: any[],
  t: (key: string, defaultValue?: string, options?: any) => string,
): any[] {
  const tableData = [];
  encounters.forEach((encounter, index) => {
    const encounterDate = new Date(encounter.encounterDatetime);
    const dateTime = `${encounterDate.toLocaleDateString()}  ${encounterDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;
    encounter.obs?.forEach((obs, obsIndex) => {
      if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['maternal-pulse']) {
        tableData.push({
          id: `maternal-pulse-${index}-${obsIndex}`,
          dateTime,
          value: parseFloat(obs.value),
          unit: t('BPM'),
        });
      }
    });
  });
  return tableData;
}

export function useMaternalPulseData(patientUuid: string) {
  const { encounters, isLoading, error, mutate } = usePartographyEncounters(patientUuid, 'maternal-pulse');
  return { data: encounters, isLoading, error, mutate };
}

export function buildMaternalPulseObservation(formData: any): any[] {
  const timeConfig = { defaultEncounterOffset: 0 };
  const obsDatetime = toOmrsIsoString(new Date(Date.now() - timeConfig.defaultEncounterOffset));
  const observations = [];
  if (formData.value || formData.measurementValue) {
    observations.push({
      concept: PARTOGRAPHY_CONCEPTS['maternal-pulse'],
      value: parseFloat(formData.value || formData.measurementValue),
      obsDatetime,
    });
  }
  // Optional time slot observation for pulse/BP graph (if provided by the form)
  if (formData.time || formData.timeSlot) {
    observations.push({
      concept: PARTOGRAPHY_CONCEPTS['pulse-time-slot'] || PARTOGRAPHY_CONCEPTS['time-slot'],
      value: formData.time || formData.timeSlot,
      obsDatetime,
    });
  }
  return observations;
}
