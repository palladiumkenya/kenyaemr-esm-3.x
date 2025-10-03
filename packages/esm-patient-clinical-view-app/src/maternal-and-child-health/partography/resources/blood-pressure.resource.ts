import { usePartographyEncounters } from '../partography.resource';
import { useTranslation } from 'react-i18next';
import { PARTOGRAPHY_CONCEPTS } from '../types';
import { toOmrsIsoString } from '@openmrs/esm-framework';

export function transformBloodPressureEncounterToChartData(
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
      if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['systolic-bp']) {
        chartData.push({ group: t('Systolic'), time: encounterTime, value: parseFloat(obs.value) });
      }
      if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['diastolic-bp']) {
        chartData.push({ group: t('Diastolic'), time: encounterTime, value: parseFloat(obs.value) });
      }
    });
  });
  return chartData;
}

export function transformBloodPressureEncounterToTableData(
  encounters: any[],
  t: (key: string, defaultValue?: string, options?: any) => string,
): any[] {
  const tableData = [];
  encounters.forEach((encounter, index) => {
    const encounterDate = new Date(encounter.encounterDatetime);
    const dateTime = `${encounterDate.toLocaleDateString()} — ${encounterDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;
    encounter.obs?.forEach((obs, obsIndex) => {
      if (
        obs.concept.uuid === PARTOGRAPHY_CONCEPTS['systolic-bp'] ||
        obs.concept.uuid === PARTOGRAPHY_CONCEPTS['diastolic-bp']
      ) {
        tableData.push({
          id: `blood-pressure-${index}-${obsIndex}`,
          dateTime,
          measurement: obs.concept.uuid === PARTOGRAPHY_CONCEPTS['systolic-bp'] ? t('Systolic') : t('Diastolic'),
          value: parseFloat(obs.value),
          unit: t('mmHg'),
        });
      }
    });
  });
  return tableData;
}

export function useBloodPressureData(patientUuid: string) {
  const { t } = useTranslation();
  const { encounters, isLoading, error, mutate } = usePartographyEncounters(patientUuid, 'blood-pressure');
  let localizedError = error;
  if (error) {
    localizedError = t('Failed to load blood pressure data');
  }
  return { data: encounters, isLoading, error: localizedError, mutate };
}

export function buildBloodPressureObservation(formData: any): any[] {
  const timeConfig = { defaultEncounterOffset: 0 };
  const obsDatetime = toOmrsIsoString(new Date(Date.now() - timeConfig.defaultEncounterOffset));
  const observations = [];
  if (formData.systolic) {
    observations.push({
      concept: PARTOGRAPHY_CONCEPTS['systolic-bp'],
      value: parseFloat(formData.systolic),
      obsDatetime,
    });
  }
  if (formData.diastolic) {
    observations.push({
      concept: PARTOGRAPHY_CONCEPTS['diastolic-bp'],
      value: parseFloat(formData.diastolic),
      obsDatetime,
    });
  }
  return observations;
}
