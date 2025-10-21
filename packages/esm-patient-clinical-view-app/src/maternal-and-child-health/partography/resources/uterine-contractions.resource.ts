import { PARTOGRAPHY_CONCEPTS } from '../types';
import {
  CONTRACTION_LEVEL_MILD_CONCEPT,
  CONTRACTION_LEVEL_MODERATE_CONCEPT,
  CONTRACTION_LEVEL_STRONG_CONCEPT,
  MOULDING_NONE_CONCEPT,
  MOULDING_SLIGHT_CONCEPT,
  MOULDING_MODERATE_CONCEPT,
  MOULDING_SEVERE_CONCEPT,
  CONTRACTION_COUNT_CONCEPT,
  URINE_VOLUME_CONCEPT,
} from '../../../config-schema';
import { toOmrsIsoString } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

export function buildUterineContractionsObservation(formData: any): any[] {
  const timeConfig = { defaultEncounterOffset: 0 };
  const obsDatetime = toOmrsIsoString(new Date(Date.now() - timeConfig.defaultEncounterOffset));
  const observations = [];
  if (formData.value || formData.measurementValue) {
    observations.push({
      concept: PARTOGRAPHY_CONCEPTS['uterine-contractions'],
      value: parseFloat(formData.value || formData.measurementValue),
      obsDatetime,
    });
  }
  return observations;
}

export function transformUterineContractionsEncounterToChartData(
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
      if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['uterine-contractions']) {
        chartData.push({
          group: t('Uterine Contractions'),
          time: encounterTime,
          value: parseFloat(obs.value),
        });
      }
    });
  });
  return chartData;
}

export function transformUterineContractionsEncounterToTableData(
  encounters: any[],
  t: (key: string, defaultValue?: string, options?: any) => string,
): any[] {
  const tableData = [];
  // Helper to map protein/acetone values to display string
  const codeToPlus = (code) => {
    // Accept both string and number
    if (!code) {
      return '';
    }
    if (code === MOULDING_NONE_CONCEPT || code === '0' || code === 0) {
      return '0';
    }
    if (code === MOULDING_SLIGHT_CONCEPT || code === '+' || code === 1) {
      return '+';
    }
    if (code === MOULDING_MODERATE_CONCEPT || code === '++' || code === 2) {
      return '++';
    }
    if (code === MOULDING_SEVERE_CONCEPT || code === '+++' || code === 3) {
      return '+++';
    }
    return String(code);
  };

  encounters.forEach((encounter, index) => {
    const encounterDate = new Date(encounter.encounterDatetime);
    const date = encounterDate.toLocaleDateString();
    // Find all relevant obs for this encounter
    let timeSlot = '';
    let contractionCount = '';
    let contractionLevel = '';
    let protein = '';
    let acetone = '';
    let volume = '';

    if (Array.isArray(encounter.obs)) {
      for (const obs of encounter.obs) {
        // Time Slot: use concept or value string
        if (
          obs.concept.uuid === PARTOGRAPHY_CONCEPTS['time-slot'] ||
          (typeof obs.value === 'string' && obs.value.startsWith('TimeSlot:'))
        ) {
          if (typeof obs.value === 'string') {
            const match = obs.value.match(/TimeSlot:\s*(.+)/);
            if (match) {
              timeSlot = match[1].trim();
            } else {
              timeSlot = obs.value;
            }
          } else {
            timeSlot = String(obs.value);
          }
        }
        // Contraction count
        if (obs.concept.uuid === CONTRACTION_COUNT_CONCEPT) {
          contractionCount = String(obs.value);
        }
        // Contraction level (none, mild, moderate, strong)
        if (
          obs.concept.uuid === MOULDING_NONE_CONCEPT || // none
          obs.concept.uuid === CONTRACTION_LEVEL_MILD_CONCEPT || // mild
          obs.concept.uuid === CONTRACTION_LEVEL_MODERATE_CONCEPT || // moderate
          obs.concept.uuid === CONTRACTION_LEVEL_STRONG_CONCEPT // strong
        ) {
          if (obs.concept.uuid === MOULDING_NONE_CONCEPT) {
            contractionLevel = 'none';
          }
          if (obs.concept.uuid === CONTRACTION_LEVEL_MILD_CONCEPT) {
            contractionLevel = 'mild';
          }
          if (obs.concept.uuid === CONTRACTION_LEVEL_MODERATE_CONCEPT) {
            contractionLevel = 'moderate';
          }
          if (obs.concept.uuid === CONTRACTION_LEVEL_STRONG_CONCEPT) {
            contractionLevel = 'strong';
          }
        }
        // Protein
        if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['protein-level']) {
          protein = codeToPlus(obs.value);
        }
        // Acetone (ketone)
        if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['ketone-level']) {
          acetone = codeToPlus(obs.value);
        }
        // Volume
        if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['urine-volume'] || obs.concept.uuid === URINE_VOLUME_CONCEPT) {
          volume = String(obs.value);
        }
      }
    }
    // Show row if date is present (do not require timeSlot/volume)
    if (date) {
      tableData.push({
        id: `uterine-contractions-${index}`,
        date,
        timeSlot,
        contractionCount,
        contractionLevel,
        protein,
        acetone,
        volume,
      });
    }
  });
  return tableData;
}

import { usePartographyEncounters } from '../partography.resource';
export function useUterineContractionsData(patientUuid: string) {
  const { t } = useTranslation();
  const { encounters, isLoading, error, mutate } = usePartographyEncounters(patientUuid, 'uterine-contractions');
  let localizedError = error;
  if (error) {
    localizedError = t('Failed to load uterine contractions data');
  }
  return { data: encounters, isLoading, error: localizedError, mutate };
}
