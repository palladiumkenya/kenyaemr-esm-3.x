import { buildUterineContractionsObservation } from './resources/uterine-contractions.resource';
import { buildBloodPressureObservation } from './resources/blood-pressure.resource';
import { buildMaternalPulseObservation } from './resources/maternal-pulse.resource';
import { openmrsFetch, restBaseUrl, toOmrsIsoString, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PARTOGRAPHY_CONCEPTS,
  PARTOGRAPHY_ENCOUNTER_TYPES,
  MCH_PARTOGRAPHY_ENCOUNTER_UUID,
  getPartographyUnit,
  type OpenMRSResponse,
  type PartographyObservation,
  type PartographyEncounter,
  type PartographyGraphType,
} from './types';
import { configSchema, type ConfigObject } from '../../config-schema';
import {
  buildTemperatureObservation,
  transformTemperatureEncounterToChartData,
  transformTemperatureEncounterToTableData,
} from './resources/temperature.resource';

export type { PartographyObservation, PartographyEncounter };
const defaultPartographyConfig = configSchema.partography._default;
const getConceptMappingsForGraphType = (graphType: string): string[] => {
  return defaultPartographyConfig.conceptMappings[graphType] || [];
};

const getFallbackEncounterTypes = (graphType: string): string[] => {
  return (
    defaultPartographyConfig.fallbackEncounterMapping[graphType] || defaultPartographyConfig.defaultFallbackSequence
  );
};

const getStationDisplay = (conceptUuid: string): string => {
  return defaultPartographyConfig.stationDisplayMapping[conceptUuid] || conceptUuid;
};

const getStationValue = (conceptUuid: string): number => {
  return defaultPartographyConfig.stationValueMapping[conceptUuid] ?? 0;
};

const getProgressEventInfo = (conceptUuid: string): { name: string; unit: string } | null => {
  return defaultPartographyConfig.progressEventConceptNames[conceptUuid] || null;
};

const getGraphTypeDisplayName = (graphType: string): string => {
  return (
    defaultPartographyConfig.graphTypeDisplayNames[graphType] ||
    graphType.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

const getTestGraphTypes = (): string[] => {
  return defaultPartographyConfig.testData.testGraphTypes;
};

const getSampleDataPoints = (): Array<{ value: number; time: string }> => {
  return defaultPartographyConfig.testData.sampleDataPoints;
};

const getTestDataConfig = () => {
  return defaultPartographyConfig.testData;
};

const doesObservationMapToGraphType = (obsConceptUuid: string, targetGraphType: string): boolean => {
  const conceptUuids = getConceptMappingsForGraphType(targetGraphType);
  return conceptUuids.includes(obsConceptUuid);
};

const generateStorageKey = (patientUuid: string, graphType: string): string => {
  return `${defaultPartographyConfig.storage.storageKeyPrefix}${patientUuid}_${graphType}`;
};

const generateCacheKey = (patientUuid: string, graphType: string): string => {
  return `${defaultPartographyConfig.storage.cacheKeyPrefix}${patientUuid}_${graphType}`;
};

const getDefaultLocationUuid = (): string => {
  return defaultPartographyConfig.defaultLocationUuid;
};

const getDefaultEncounterProviderRole = (): string => {
  return defaultPartographyConfig.defaultEncounterProviderRole;
};

const getRetryFallbackTypes = (): string[] => {
  return defaultPartographyConfig.retryFallbackTypes;
};

const getTimeConfig = () => {
  return defaultPartographyConfig.timeConfig;
};

const getStorageConfig = () => {
  return defaultPartographyConfig.storage;
};
export const usePartographyConfig = () => {
  const config = useConfig<ConfigObject>();
  return config.partography;
};

let encounterTypeCache: { [key: string]: string } = {};

async function discoverEncounterTypes(): Promise<{ [key: string]: string }> {
  if (Object.keys(encounterTypeCache).length > 0) {
    return encounterTypeCache;
  }

  try {
    const response = await openmrsFetch(`${restBaseUrl}/encountertype?v=default`);

    if (response.ok) {
      const data = await response.json();
      const encounterTypes = data.results || [];
      encounterTypes.forEach((et) => {
        const normalizedName = et.name.toLowerCase().replace(/\s+/g, '-');
        encounterTypeCache[normalizedName] = et.uuid;
        if (et.display) {
          const normalizedDisplay = et.display.toLowerCase().replace(/\s+/g, '-');
          encounterTypeCache[normalizedDisplay] = et.uuid;
        }
      });

      return encounterTypeCache;
    } else {
      return {};
    }
  } catch (error) {
    return {};
  }
}

async function getEncounterTypeForGraph(graphType: string): Promise<string | null> {
  const predefinedType = PARTOGRAPHY_ENCOUNTER_TYPES[graphType];
  if (predefinedType) {
    return predefinedType;
  }
  const availableTypes = await discoverEncounterTypes();
  const specificType = availableTypes[graphType];
  if (specificType) {
    return specificType;
  }

  for (const pattern of defaultPartographyConfig.encounterPatterns) {
    if (availableTypes[pattern]) {
      return availableTypes[pattern];
    }
  }

  const fallbacks = getFallbackEncounterTypes(graphType);

  for (const fallback of fallbacks) {
    if (availableTypes[fallback]) {
      return availableTypes[fallback];
    }
  }

  const anyType = Object.values(availableTypes)[0];
  if (anyType) {
    return anyType;
  }

  return null;
}

export function usePartographyEncounters(patientUuid: string, graphType: string) {
  const customRep =
    'custom:(uuid,encounterDatetime,encounterType:(uuid,display),obs:(uuid,concept:(uuid,display),value,obsDatetime))';

  const [encounterTypeUuid, setEncounterTypeUuid] = useState<string | null>(null);
  useEffect(() => {
    if (patientUuid && graphType) {
      getEncounterTypeForGraph(graphType).then(setEncounterTypeUuid);
    }
  }, [patientUuid, graphType]);
  const apiUrl =
    encounterTypeUuid && patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${encounterTypeUuid}&v=${customRep}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<OpenMRSResponse<PartographyEncounter>>(
    apiUrl,
    async (url: string) => {
      const response = await openmrsFetch(url);
      return response.data;
    },
  );

  const encounters = data?.results ?? [];

  return {
    encounters,
    isLoading: isLoading || !encounterTypeUuid,
    error,
    mutate,
  };
}

export function usePartographyData(patientUuid: string, graphType: string) {
  const { encounters, isLoading, error, mutate } = usePartographyEncounters(patientUuid, graphType);

  const localDataFallback = useSWR(
    !isLoading && encounters.length === 0 ? `partography_local_${patientUuid}_${graphType}` : null,
    () => {
      const localData = loadPartographyData(patientUuid, graphType);
      return localData;
    },
  );

  const finalData = encounters.length > 0 ? encounters : localDataFallback.data || [];

  return {
    data: finalData,
    isLoading: isLoading || localDataFallback.isLoading,
    error: error || localDataFallback.error,
    mutate: async () => {
      await mutate();
      if (localDataFallback.mutate) {
        await localDataFallback.mutate();
      }
    },
  };
}

function loadPartographyData(patientUuid: string, graphType: string): PartographyEncounter[] {
  try {
    const storageKey = generateStorageKey(patientUuid, graphType);
    const localData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const localEncounters = localData.map((item) => ({
      uuid: item.id,
      encounterDatetime: item.timestamp,
      encounterType: { uuid: 'localStorage', display: 'Partography (Local Storage)' },
      obs: [
        {
          uuid: `obs_${item.id}`,
          concept: { uuid: 'partography-data', display: 'Partography Data' },
          value: JSON.stringify({
            graphType: item.graphType,
            timestamp: item.timestamp,
            data: item.data,
          }),
          obsDatetime: item.timestamp,
          encounter: {
            uuid: item.id,
            encounterType: { uuid: 'localStorage', display: 'Partography (Local Storage)' },
          },
        },
      ],
    }));
    return localEncounters.sort(
      (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
    );
  } catch {
    return [];
  }
}

export async function createPartographyEncounter(
  patientUuid: string,
  graphType: string,
  formData: any,
  locationUuid?: string,
  providerUuid?: string,
  t?: (key: string, fallback?: string) => string,
): Promise<{ success: boolean; message: string; encounter?: PartographyEncounter }> {
  const translate = t || ((key, fallback) => fallback || key);
  try {
    const observations = buildObservations(graphType, formData);
    if (observations.length === 0) {
      throw new Error(translate('noValidObservations', 'No valid observations to save'));
    }
    const encounterTypeUuid = await getEncounterTypeForGraph(graphType);
    if (!encounterTypeUuid) {
      throw new Error(translate('noEncounterTypeFound', `No encounter type found for graph: ${graphType}`));
    }
    let finalLocationUuid = locationUuid;
    if (!finalLocationUuid) {
      try {
        const sessionResponse = await openmrsFetch(`${restBaseUrl}/session`);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.sessionLocation?.uuid) {
            finalLocationUuid = sessionData.sessionLocation.uuid;
          }
        }
      } catch {}
      if (!finalLocationUuid) {
        finalLocationUuid = getDefaultLocationUuid();
      }
    }
    const timeConfig = getTimeConfig();
    const encounterDatetime = toOmrsIsoString(new Date(Date.now() - timeConfig.defaultEncounterOffset));
    const encounterPayload: any = {
      patient: patientUuid,
      location: finalLocationUuid,
      encounterDatetime: encounterDatetime,
      obs: observations,
      encounterType: encounterTypeUuid,
    };
    let finalProviderUuid = providerUuid;
    if (!finalProviderUuid) {
      try {
        const sessionResponse = await openmrsFetch(`${restBaseUrl}/session`);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const currentUser = sessionData.user;
          if (currentUser && currentUser.person) {
            const providerResponse = await openmrsFetch(
              `${restBaseUrl}/provider?person=${currentUser.person.uuid}&v=default`,
            );
            if (providerResponse.ok) {
              const providerData = await providerResponse.json();
              if (providerData.results && providerData.results.length > 0) {
                finalProviderUuid = providerData.results[0].uuid;
              }
            }
          }
        }
      } catch {}
      if (!finalProviderUuid) {
        try {
          const anyProviderResponse = await openmrsFetch(`${restBaseUrl}/provider?v=default&limit=1`);
          if (anyProviderResponse.ok) {
            const anyProviderData = await anyProviderResponse.json();
            if (anyProviderData.results && anyProviderData.results.length > 0) {
              finalProviderUuid = anyProviderData.results[0].uuid;
            }
          }
        } catch {}
      }
    }
    if (finalProviderUuid) {
      try {
        const providerValidationResponse = await openmrsFetch(`${restBaseUrl}/provider/${finalProviderUuid}?v=default`);
        if (providerValidationResponse.ok) {
          encounterPayload.encounterProviders = [
            {
              provider: finalProviderUuid,
              encounterRole: getDefaultEncounterProviderRole(),
              voided: false,
            },
          ];
        }
      } catch {}
    }
    if (!patientUuid) {
      throw new Error(translate('Patient UUID is required'));
    }
    if (!finalLocationUuid) {
      throw new Error(translate('Location UUID is required'));
    }
    if (!encounterTypeUuid) {
      throw new Error(translate('Encounter type UUID is required'));
    }
    if (!observations || observations.length === 0) {
      throw new Error(translate('At least one observation is required'));
    }
    const response = await openmrsFetch(`${restBaseUrl}/encounter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encounterPayload),
    });
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            const detailedError = JSON.parse(responseText);
            if (detailedError.error) {
              if (detailedError.error.message) {
                errorMessage += ` - ${detailedError.error.message}`;
              }
              if (detailedError.error.detail) {
                errorMessage += ` (${detailedError.error.detail})`;
              }
            }
          } catch {
            errorMessage += ` - Raw Response: ${responseText}`;
          }
        }
      } catch {}
      throw new Error(errorMessage);
    }
    const encounter = await response.json();
    const cacheKey = generateCacheKey(patientUuid, graphType);
    try {
      const { mutate: globalMutate } = await import('swr');
      await globalMutate(cacheKey);
      const timeConfig = getTimeConfig();
      setTimeout(async () => {
        await globalMutate(cacheKey);
      }, timeConfig.cacheInvalidationDelay);
    } catch {}
    return {
      success: true,
      message: translate('partographyDataSavedSuccessfully', 'Partography data saved successfully'),
      encounter,
    };
  } catch (error: any) {
    // Log error details for debugging
    // eslint-disable-next-line no-console
    console.error('createPartographyEncounter error:', error);
    return {
      success: false,
      message: translate(
        'failedToSavePartographyData',
        `Failed to save partography data: ${error && error.message ? error.message : String(error)}`,
      ),
    };
  }
}

async function saveToLocalStorage(
  patientUuid: string,
  graphType: string,
  formData: any,
  encounterUuid?: string,
): Promise<void> {
  const entryId = encounterUuid || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = toOmrsIsoString(new Date());

  const dataEntry = {
    id: entryId,
    timestamp,
    graphType,
    data: formData,
    encounterUuid,
  };

  const storageKey = generateStorageKey(patientUuid, graphType);
  const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');

  existingData.push(dataEntry);

  const storageConfig = getStorageConfig();
  if (existingData.length > storageConfig.maxLocalEntries) {
    existingData.splice(0, existingData.length - storageConfig.maxLocalEntries);
  }

  localStorage.setItem(storageKey, JSON.stringify(existingData));
}

function buildObservations(graphType: string, formData: any): any[] {
  const observations = [];
  const timeConfig = getTimeConfig();
  const obsDatetime = toOmrsIsoString(new Date(Date.now() - timeConfig.defaultEncounterOffset));

  switch (graphType) {
    case 'membrane-amniotic-fluid':
      if (formData.time) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'],
          value: `Time: ${formData.time}`,
          obsDatetime,
        });
      }
      const amnioticFluidMap = defaultPartographyConfig.amnioticFluidMap;
      let amnioticFluidValue = formData.amnioticFluid;
      if (amnioticFluidValue && amnioticFluidMap[amnioticFluidValue]) {
        amnioticFluidValue = amnioticFluidMap[amnioticFluidValue];
      }
      if (amnioticFluidValue) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['amniotic-fluid'],
          value: amnioticFluidValue,
          obsDatetime,
        });
      }
      const mouldingMap = defaultPartographyConfig.mouldingMap;
      let mouldingValue = formData.moulding;
      if (mouldingValue && mouldingMap[mouldingValue]) {
        mouldingValue = mouldingMap[mouldingValue];
      }
      if (mouldingValue) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['moulding'],
          value: mouldingValue,
          obsDatetime,
        });
      }
      break;
    case 'fetal-heart-rate':
      if (formData.fetalHeartRate || formData.value || formData.measurementValue) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate'],
          value: parseFloat(formData.fetalHeartRate || formData.value || formData.measurementValue),
          obsDatetime,
        });
      }

      if (formData.hour !== undefined && formData.hour !== '') {
        try {
          const hourValue = parseFloat(formData.hour);

          if (hourValue >= 0 && hourValue <= 24) {
            const hourText = `Hour: ${hourValue}`;
            observations.push({
              concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate-hour'],
              value: hourText,
              obsDatetime,
            });
          }
        } catch (error) {}
      }

      if (formData.time) {
        try {
          observations.push({
            concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'],
            value: `Time: ${formData.time}`,
            obsDatetime,
          });
        } catch (error) {}
      }
      break;

    case 'cervical-dilation':
      if (formData.value || formData.measurementValue) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['cervical-dilation'],
          value: parseFloat(formData.value || formData.measurementValue),
          obsDatetime,
        });
      }

      if (formData.amnioticFluid) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['amniotic-fluid'],
          value: formData.amnioticFluid,
          obsDatetime,
        });
      }

      if (formData.moulding) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['moulding'],
          value: formData.moulding,
          obsDatetime,
        });
      }
      break;

    case 'descent-of-head': {
      if (formData.value || formData.measurementValue) {
        let conceptValue = formData.value || formData.measurementValue;
        if (formData.conceptUuid) {
          conceptValue = formData.conceptUuid;
        }
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['descent-of-head'],
          value: conceptValue,
          obsDatetime,
        });
      }
      break;
    }
    case 'pulse-bp-combined': {
      // Save both maternal pulse and blood pressure observations
      const pulseObs = buildMaternalPulseObservation({ value: formData.pulse });
      const bpObs = buildBloodPressureObservation({ systolic: formData.systolic, diastolic: formData.diastolic });
      return [...pulseObs, ...bpObs];
    }
    case 'uterine-contractions': {
      return buildUterineContractionsObservation(formData);
    }
    case 'maternal-pulse': {
      return [];
    }
    case 'blood-pressure': {
      return [];
    }
    case 'temperature': {
      return buildTemperatureObservation(formData);
    }
    case 'urine-analysis': {
      if (formData.proteinLevel) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['protein-level'],
          value: formData.proteinLevel,
          obsDatetime,
        });
      }
      if (formData.glucoseLevel) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['glucose-level'],
          value: formData.glucoseLevel,
          obsDatetime,
        });
      }
      if (formData.ketoneLevel) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['ketone-level'],
          value: formData.ketoneLevel,
          obsDatetime,
        });
      }
      break;
    }

    case 'drugs-fluids':
      if (formData.medication || formData.drugName) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['medication'],
          value: formData.medication || formData.drugName,
          obsDatetime,
        });
      }
      if (formData.dosage) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['dosage'],
          value: formData.dosage,
          obsDatetime,
        });
      }
      if (formData.route) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['route'] || PARTOGRAPHY_CONCEPTS['event-description'],
          value: formData.route,
          obsDatetime,
        });
      }
      if (formData.frequency) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['frequency'] || PARTOGRAPHY_CONCEPTS['event-description'],
          value: formData.frequency,
          obsDatetime,
        });
      }
      break;

    case 'progress-events':
      if (formData.eventType) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['event-type'],
          value: formData.eventType,
          obsDatetime,
        });
      }
      if (formData.eventDescription) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['event-description'],
          value: formData.eventDescription,
          obsDatetime,
        });
      }
      break;

    default:
      if (formData.value || formData.measurementValue) {
        const conceptUuid = PARTOGRAPHY_CONCEPTS[graphType];
        if (conceptUuid) {
          observations.push({
            concept: conceptUuid,
            value: parseFloat(formData.value || formData.measurementValue),
            obsDatetime,
          });
        }
      }
      break;
  }

  return observations;
}

export function transformEncounterToChartData(encounters: any[], graphType: string): any[] {
  if (graphType === 'temperature') {
    return transformTemperatureEncounterToChartData(encounters);
  }
  return [];
}

function getGroupNameForGraph(graphType: string): string {
  return getGraphTypeDisplayName(graphType);
}

export function createTestPartographyData(patientUuid: string) {
  const testConfig = getTestDataConfig();
  const testGraphTypes = testConfig.testGraphTypes;
  const sampleDataPoints = testConfig.sampleDataPoints;
  const valueIncrement = testConfig.valueIncrement;
  const bloodPressureDecrement = testConfig.bloodPressureDecrement;

  testGraphTypes.forEach(async (graphType, index) => {
    const enhancedDataPoints = sampleDataPoints.map((point) => ({
      ...point,
      value: point.value + index * valueIncrement,
    }));

    for (const dataPoint of enhancedDataPoints) {
      const formData =
        graphType === 'blood-pressure'
          ? {
              systolic: dataPoint.value,
              diastolic: dataPoint.value - bloodPressureDecrement,
              time: dataPoint.time,
            }
          : { value: dataPoint.value, time: dataPoint.time };

      try {
        await saveToLocalStorage(patientUuid, graphType, formData);
      } catch (error) {}
    }
  });
}

export function transformEncounterToTableData(
  encounters: PartographyEncounter[],
  graphType: string,
  t?: (key: string, fallback?: string) => string,
): any[] {
  const tableData = [];

  const getUnitForGraphType = (type: string): string => {
    return getPartographyUnit(type as PartographyGraphType) || '';
  };

  interface ObservationConcept {
    uuid: string;
    display?: string;
  }

  interface ObservationForMapping {
    concept?: ObservationConcept;
  }

  const mapObservationToGraphType = (obs: ObservationForMapping, targetGraphType: string): boolean => {
    return doesObservationMapToGraphType(obs.concept?.uuid || '', targetGraphType);
  };

  encounters.forEach((encounter, index) => {
    const encounterDate = new Date(encounter.encounterDatetime);
    const dateTime = `${encounterDate.toLocaleDateString()} — ${encounterDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;

    encounter.obs.forEach((obs, obsIndex) => {
      try {
        if (typeof obs.value === 'string') {
          const parsedData = JSON.parse(obs.value);

          if (parsedData.graphType === graphType && parsedData.data) {
            const formData = parsedData.data;
            let value = formData.value || formData.measurementValue;

            if (graphType === 'descent-of-head' && formData.conceptUuid) {
              value = formData.conceptUuid;
            }

            if (value) {
              let displayValue;

              if (graphType === 'descent-of-head') {
                let valueToMap;
                if (typeof value === 'object' && value !== null) {
                  const valueObj = value as any;
                  if (valueObj.conceptUuid) {
                    valueToMap = valueObj.conceptUuid;
                  } else if (valueObj.value) {
                    valueToMap = valueObj.value;
                  } else {
                    valueToMap = String(value);
                  }
                } else {
                  valueToMap = String(value);
                }

                displayValue = getStationDisplay(valueToMap);
              } else {
                const numericValue = parseFloat(String(value));
                if (!isNaN(numericValue)) {
                  displayValue = numericValue.toFixed(1);
                } else {
                  displayValue = String(value);
                }
              }

              const rowData = {
                id: `${graphType}-${index}-${obsIndex}`,
                dateTime,
                value: displayValue,
                unit: getUnitForGraphType(graphType),
              };
              tableData.push(rowData);
            }
          }
        } else {
          throw new Error('Not a JSON string');
        }
      } catch (e) {
        if (mapObservationToGraphType(obs, graphType)) {
          let conceptName = obs.concept?.display || t?.('unknown', 'Unknown') || 'Unknown';
          let unit = getUnitForGraphType(graphType);

          if (graphType === 'progress-events') {
            const eventInfo = getProgressEventInfo(obs.concept?.uuid || '');
            if (eventInfo) {
              conceptName = eventInfo.name;
              unit = eventInfo.unit;
            } else {
              conceptName = obs.concept?.display || t?.('progressEvent', 'Progress Event') || 'Progress Event';
            }
          }

          let displayValue;
          if (graphType === 'descent-of-head') {
            let valueToMap;
            if (typeof obs.value === 'object' && obs.value !== null) {
              const valueObj = obs.value as any;
              if (valueObj.conceptUuid) {
                valueToMap = valueObj.conceptUuid;
              } else if (valueObj.value) {
                valueToMap = valueObj.value;
              } else {
                valueToMap = String(obs.value);
              }
            } else {
              valueToMap = String(obs.value);
            }

            displayValue = getStationDisplay(valueToMap);
          } else {
            const numericValue = parseFloat(String(obs.value));
            if (!isNaN(numericValue)) {
              displayValue = numericValue.toFixed(1);
            } else {
              displayValue = String(obs.value);
            }
          }

          const rowData = {
            id: `${graphType}-${index}-${obsIndex}`,
            dateTime,
            measurement: conceptName,
            value: displayValue,
            unit: unit,
          };
          tableData.push(rowData);
        }
      }
    });
  });

  return tableData.sort(
    (a, b) => new Date(a.dateTime.split(' — ')[0]).getTime() - new Date(b.dateTime.split(' — ')[0]).getTime(),
  );
}

export { useFetalHeartRateData } from './resources/fetal-heart-rate.resource';
export { useDrugOrders, saveDrugOrderData } from './resources/drugs-fluids.resource';
export { saveMembraneAmnioticFluidData } from './resources/membrane-amniotic-fluid.resource';
