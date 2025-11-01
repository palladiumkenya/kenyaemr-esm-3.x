// Hook to fetch and manage membrane amniotic fluid and moulding data from OpenMRS
export function useMembraneAmnioticFluidData(patientUuid: string) {
  const fetcher = (url: string) => openmrsFetch(url).then((res) => res.json());

  const { data, error, isLoading, mutate } = useSWR(
    patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=full&limit=100&order=desc`
      : null,
    fetcher,
    {
      onError: (error) => {
        console.error('Error fetching membrane amniotic fluid data:', error);
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const membraneAmnioticFluidEntries = useMemo(() => {
    try {
      if (!data?.results || !Array.isArray(data.results)) {
        return [];
      }

      const entries = [];
      for (const encounter of data.results) {
        if (!encounter.obs || !Array.isArray(encounter.obs)) {
          continue;
        }

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
    } catch (error) {
      console.error('Error processing membrane amniotic fluid data:', error);
      return [];
    }
  }, [data]);

  return {
    membraneAmnioticFluidEntries,
    isLoading,
    error,
    mutate,
  };
}

// Function to save membrane amniotic fluid and moulding data to OpenMRS
export async function saveMembraneAmnioticFluidData(
  patientUuid: string,
  formData: { amnioticFluid: string; moulding: string; time: string },
  t: unknown,
  locationUuid?: string,
  providerUuid?: string,
) {
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
      throw new Error(result?.message || 'Failed to save membrane amniotic fluid data');
    }
  } catch (error) {
    console.error('Error saving membrane amniotic fluid data:', error);
    throw new Error(error?.message || 'Failed to save membrane amniotic fluid data');
  }
}
import { openmrsFetch, restBaseUrl, toOmrsIsoString, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import React, { useState, useEffect, useMemo } from 'react';
import {
  PARTOGRAPHY_CONCEPTS,
  PARTOGRAPHY_ENCOUNTER_TYPES,
  MCH_PARTOGRAPHY_ENCOUNTER_UUID,
  URINE_TEST_TIME_SLOT_CONCEPT,
  getPartographyUnit,
  type OpenMRSResponse,
  type PartographyObservation,
  type PartographyEncounter,
  type PartographyGraphType,
} from './types';
import {
  configSchema,
  type ConfigObject,
  TIME_RESULTS_RETURNED,
  TIME_SAMPLE_COLLECTED,
  EVENT_DESCRIPTION_CONCEPT,
  CONTRACTION_COUNT_CONCEPT,
  UTERINE_CONTRACTIONS_CONCEPT,
  CONTRACTION_LEVEL_MILD_CONCEPT,
  CONTRACTION_LEVEL_MODERATE_CONCEPT,
  CONTRACTION_LEVEL_STRONG_CONCEPT,
  MOULDING_NONE_CONCEPT,
} from '../../config-schema';

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
  } catch (e) {
    return [];
  }
}

export async function createPartographyEncounter(
  patientUuid: string,
  graphType: string,
  formData: any,
  locationUuid?: string,
  providerUuid?: string,
  signal?: AbortSignal,
  t?: (key: string, fallback?: string) => string,
): Promise<{ success: boolean; message: string; encounter?: PartographyEncounter }> {
  try {
    const observations = buildObservations(graphType, formData);

    if (observations.length === 0) {
      throw new Error(t?.('noValidObservations', 'No valid observations to save') || 'No valid observations to save');
    }

    const encounterTypeUuid = await getEncounterTypeForGraph(graphType);
    if (!encounterTypeUuid) {
      throw new Error(
        t?.('noEncounterTypeFound', 'No encounter type found for graph: {{graphType}}')?.replace(
          '{{graphType}}',
          graphType,
        ) || `No encounter type found for graph: ${graphType}`,
      );
    }

    let finalLocationUuid = locationUuid;

    // If no location provided, try to get from session or use default
    if (!finalLocationUuid) {
      try {
        const sessionResponse = await openmrsFetch(`${restBaseUrl}/session`);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.sessionLocation?.uuid) {
            finalLocationUuid = sessionData.sessionLocation.uuid;
          }
        }
      } catch (error) {
        console.warn('Could not get session location:', error);
      }

      // Fallback to default if still no location
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
      encounterType: { uuid: encounterTypeUuid },
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
      } catch (error) {}

      if (!finalProviderUuid) {
        try {
          const anyProviderResponse = await openmrsFetch(`${restBaseUrl}/provider?v=default&limit=1`);
          if (anyProviderResponse.ok) {
            const anyProviderData = await anyProviderResponse.json();
            if (anyProviderData.results && anyProviderData.results.length > 0) {
              finalProviderUuid = anyProviderData.results[0].uuid;
            }
          }
        } catch (error) {}
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
      } catch (validationError) {}
    }

    // Validate required fields before making API call
    if (!patientUuid) {
      throw new Error('Patient UUID is required');
    }
    if (!finalLocationUuid) {
      throw new Error('Location UUID is required');
    }
    if (!encounterTypeUuid) {
      throw new Error('Encounter type UUID is required');
    }
    if (!observations || observations.length === 0) {
      throw new Error('At least one observation is required');
    }

    const encounterUrl = `${restBaseUrl}/encounter`;
    const response = await openmrsFetch(encounterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encounterPayload),
      signal: signal, // Add abort signal support
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
          } catch (parseError) {
            errorMessage += ` - Raw Response: ${responseText}`;
          }
        }
      } catch (e) {}
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
    } catch (mutateError) {}

    return {
      success: true,
      message:
        t?.('partographyDataSavedSuccessfully', 'Partography data saved successfully') ||
        'Partography data saved successfully',
      encounter,
    };
  } catch (error) {
    return {
      success: false,
      message:
        t?.('failedToSavePartographyData', 'Failed to save partography data: {{error}}')?.replace(
          '{{error}}',
          error.message,
        ) || `Failed to save partography data: ${error.message}`,
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
    case 'pulse-bp-combined':
      if (formData.pulse) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['maternal-pulse'],
          value: parseFloat(formData.pulse),
          obsDatetime,
        });
      }
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
      break;
    case 'membrane-amniotic-fluid':
      if (formData.time) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'],
          value: `Time: ${formData.time}`,
          obsDatetime,
        });
      }

      const amnioticFluidMap = {
        'Membrane intact': '164899AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'Clear liquor': '159484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'Meconium Stained': '134488AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        Absent: '163747AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'Blood Stained': '1077AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      };
      let amnioticFluidValue = formData.amnioticFluid;
      if (amnioticFluidValue && amnioticFluidMap[amnioticFluidValue]) {
        amnioticFluidValue = amnioticFluidMap[amnioticFluidValue];
      }
      if (amnioticFluidValue) {
        observations.push({
          concept: '162653AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          value: amnioticFluidValue,
          obsDatetime,
        });
      }
      const mouldingMap = {
        '0': '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '+': '1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '++': '1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '+++': '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      };
      let mouldingValue = formData.moulding;
      if (mouldingValue && mouldingMap[mouldingValue]) {
        mouldingValue = mouldingMap[mouldingValue];
      }
      if (mouldingValue) {
        observations.push({
          concept: '166527AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
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

      // Save hour as a string in the format 'Hour: X' to match backend expectations
      if (formData.hour !== undefined && formData.hour !== '') {
        try {
          const hourValue = parseFloat(formData.hour);
          if (!isNaN(hourValue) && hourValue >= 0 && hourValue <= 24) {
            observations.push({
              concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate-hour'],
              value: `Hour: ${hourValue}`,
              obsDatetime,
            });
          }
        } catch (error) {
          console.warn('Skipping hour observation due to validation error:', error);
        }
      }

      // Using text concept for time (should work fine)
      if (formData.time) {
        try {
          observations.push({
            concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'],
            value: `Time: ${formData.time}`,
            obsDatetime,
          });
        } catch (error) {
          console.warn('Skipping time observation due to validation error:', error);
        }
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

    case 'descent-of-head':
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

    case 'uterine-contractions':
      if (formData.contractionCount !== undefined) {
        observations.push({
          concept: '159682AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          value: parseInt(formData.contractionCount, 10),
          obsDatetime,
        });
      }
      if (formData.contractionLevel) {
        observations.push({
          concept: '163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          value: formData.contractionLevel, // UUID string for coded value
          obsDatetime,
        });
      }
      if (formData.timeSlot) {
        observations.push({
          concept: URINE_TEST_TIME_SLOT_CONCEPT,
          value: `Time: ${formData.timeSlot}`,
          obsDatetime,
        });
      }
      break;

    case 'maternal-pulse':
      if (formData.value || formData.measurementValue) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['maternal-pulse'],
          value: parseFloat(formData.value || formData.measurementValue),
          obsDatetime,
        });
      }
      break;

    case 'blood-pressure':
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
      break;

    case 'temperature':
      if (formData.value || formData.measurementValue) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['temperature'],
          value: parseFloat(formData.value || formData.measurementValue),
          obsDatetime,
        });
      }
      // Save time observation if provided
      if (formData.time) {
        observations.push({
          concept: '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          value: `Time: ${formData.time}`,
          obsDatetime,
        });
      }
      break;

    case 'urine-analysis':
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
      if (formData.volume !== undefined && formData.volume !== null && formData.volume !== '') {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['urine-volume'],
          value: formData.volume,
          obsDatetime,
        });
      }

      if (formData.timeSlot) {
        observations.push({
          concept: URINE_TEST_TIME_SLOT_CONCEPT,
          value: `Time: ${formData.timeSlot}`,
          obsDatetime,
        });
      }

      if (formData.timeSampleCollected) {
        observations.push({
          concept: TIME_SAMPLE_COLLECTED,
          value: formData.timeSampleCollected,
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

      if (formData.timeResultsReturned) {
        observations.push({
          concept: TIME_RESULTS_RETURNED,
          value: formData.timeResultsReturned,
          obsDatetime,
        });
      }
      break;

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
          concept: PARTOGRAPHY_CONCEPTS['event-description'],
          value: `Route: ${formData.route}`,
          obsDatetime,
        });
      }
      if (formData.frequency) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['event-description'],
          value: `Frequency: ${formData.frequency}`,
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

export function transformEncounterToChartData(encounters: PartographyEncounter[], graphType: string): any[] {
  const chartData = [];

  encounters.forEach((encounter) => {
    const encounterTime = new Date(encounter.encounterDatetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    encounter.obs?.forEach((obs) => {
      try {
        if (typeof obs.value === 'string' && obs.value.startsWith('{')) {
          const parsedData = JSON.parse(obs.value);
          if (parsedData.graphType === graphType && parsedData.data) {
            const formData = parsedData.data;
            const value = formData.value || formData.measurementValue;
            if (value) {
              const dataPoint = {
                group: getGraphTypeDisplayName(graphType),
                time: formData.time || encounterTime,
                value: parseFloat(value),
              };
              chartData.push(dataPoint);
            }
          }
        } else {
          const conceptUuid = obs.concept.uuid;
          let value = null;
          let groupName = '';

          if (graphType === 'uterine-contractions') {
            if (conceptUuid === PARTOGRAPHY_CONCEPTS['uterine-contractions']) {
              value = parseFloat(obs.value as string);
              groupName = getGraphTypeDisplayName('uterine-contractions');
            }

            const contractionLevelMap: Record<string, string> = {
              MOULDING_NONE_CONCEPT: 'none',
              CONTRACTION_LEVEL_MILD_CONCEPT: 'mild',
              CONTRACTION_LEVEL_MODERATE_CONCEPT: 'moderate',
              CONTRACTION_LEVEL_STRONG_CONCEPT: 'strong',
            };
            if (contractionLevelMap[conceptUuid]) {
              const contractionLevelValueMap: Record<string, number> = {
                none: 0,
                mild: 1,
                moderate: 2,
                strong: 3,
              };
              value = contractionLevelValueMap[contractionLevelMap[conceptUuid]];
              groupName = contractionLevelMap[conceptUuid];
            }
          } else {
            switch (conceptUuid) {
              case PARTOGRAPHY_CONCEPTS['fetal-heart-rate']:
                if (graphType === 'fetal-heart-rate') {
                  value = parseFloat(obs.value as string);
                  groupName = getGraphTypeDisplayName('fetal-heart-rate');
                }
                break;
              case PARTOGRAPHY_CONCEPTS['cervical-dilation']:
                if (graphType === 'cervical-dilation') {
                  value = parseFloat(obs.value as string);
                  groupName = getGraphTypeDisplayName('cervical-dilation');
                }
                break;
              case PARTOGRAPHY_CONCEPTS['descent-of-head']:
                if (graphType === 'descent-of-head') {
                  value = getStationValue(obs.value as string) ?? parseFloat(obs.value as string);
                  groupName = getGraphTypeDisplayName('descent-of-head');
                }
                break;
              case PARTOGRAPHY_CONCEPTS['maternal-pulse']:
                if (graphType === 'maternal-pulse') {
                  value = parseFloat(obs.value as string);
                  groupName = getGraphTypeDisplayName('maternal-pulse');
                }
                break;
              case PARTOGRAPHY_CONCEPTS['systolic-bp']:
                if (graphType === 'blood-pressure') {
                  value = parseFloat(obs.value as string);
                  groupName = 'Systolic';
                }
                break;
              case PARTOGRAPHY_CONCEPTS['diastolic-bp']:
                if (graphType === 'blood-pressure') {
                  value = parseFloat(obs.value as string);
                  groupName = 'Diastolic';
                }
                break;
              case PARTOGRAPHY_CONCEPTS['temperature']:
                if (graphType === 'temperature') {
                  value = parseFloat(obs.value as string);
                  groupName = getGraphTypeDisplayName('temperature');
                }
                break;
              default:
                if (typeof obs.value === 'number' || !isNaN(parseFloat(obs.value as string))) {
                  value = parseFloat(obs.value as string);
                  groupName = getGraphTypeDisplayName(graphType);
                }
                break;
            }
          }
          if (value !== null && groupName) {
            const dataPoint = {
              group: groupName,
              time: encounterTime,
              value: value,
            };
            chartData.push(dataPoint);
          }
        }
      } catch (e) {}
    });
  });

  return chartData.sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    const minutesA = timeA[0] * 60 + (timeA[1] || 0);
    const minutesB = timeB[0] * 60 + (timeB[1] || 0);

    return minutesA - minutesB;
  });
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

    if (graphType === 'uterine-contractions') {
      let timeSlot = '';
      let contractionCount = '';
      let contractionLevel = 'none';
      if (Array.isArray(encounter.obs)) {
        for (const obs of encounter.obs) {
          // Time slot
          if (
            obs.concept.uuid === EVENT_DESCRIPTION_CONCEPT &&
            typeof obs.value === 'string' &&
            obs.value.startsWith('Time:')
          ) {
            const match = obs.value.match(/Time:\s*(.+)/);
            if (match) {
              timeSlot = match[1].trim();
            }
          }

          if (obs.concept.uuid === CONTRACTION_COUNT_CONCEPT) {
            contractionCount = String(obs.value);
          }
        }

        for (const obs of encounter.obs) {
          if (obs.concept.uuid === UTERINE_CONTRACTIONS_CONCEPT) {
            let levelUuid = '';
            if (typeof obs.value === 'string') {
              levelUuid = obs.value;
            } else if (obs.value != null && typeof obs.value === 'object' && (obs.value as any)?.uuid) {
              levelUuid = (obs.value as any).uuid;
            }
            if (levelUuid === MOULDING_NONE_CONCEPT) {
              contractionLevel = 'none';
            }
            if (levelUuid === CONTRACTION_LEVEL_MILD_CONCEPT) {
              contractionLevel = 'mild';
            }
            if (levelUuid === CONTRACTION_LEVEL_MODERATE_CONCEPT) {
              contractionLevel = 'moderate';
            }
            if (levelUuid === CONTRACTION_LEVEL_STRONG_CONCEPT) {
              contractionLevel = 'strong';
            }
          }
        }
      }
      if (contractionCount || contractionLevel !== 'none') {
        tableData.push({
          id: `${graphType}-${index}`,
          dateTime,
          timeSlot,
          contractionCount,
          contractionLevel,
          unit: getUnitForGraphType(graphType),
        });
      }
    } else {
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
    }
  });

  return tableData.sort(
    (a, b) => new Date(a.dateTime.split(' — ')[0]).getTime() - new Date(b.dateTime.split(' — ')[0]).getTime(),
  );
}

export function useFetalHeartRateData(patientUuid: string) {
  const fetcher = (url: string) => openmrsFetch(url).then((res) => res.json());

  const { data, error, isLoading, mutate } = useSWR(
    patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${MCH_PARTOGRAPHY_ENCOUNTER_UUID}&v=full&limit=100&order=desc`
      : null,
    fetcher,
    {
      onError: (error) => {
        console.error('Error fetching fetal heart rate data:', error);
      },
    },
  );

  const fetalHeartRateData = useMemo(() => {
    try {
      if (!data?.results || !Array.isArray(data.results)) {
        return [];
      }

      const fetalHeartRateEntries = [];

      for (const encounter of data.results) {
        if (!encounter.obs || !Array.isArray(encounter.obs)) {
          continue;
        }

        const fetalHeartRateObs = encounter.obs.find(
          (obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['fetal-heart-rate'],
        );

        if (fetalHeartRateObs) {
          const encounterDatetime = new Date(encounter.encounterDatetime);

          let hour = 0;
          let time = '';

          const hourObs = encounter.obs.find(
            (obs) =>
              obs.concept.uuid === PARTOGRAPHY_CONCEPTS['fetal-heart-rate-hour'] &&
              obs.value &&
              typeof obs.value === 'string' &&
              obs.value.startsWith('Hour:'),
          );

          const timeObs = encounter.obs.find(
            (obs) =>
              obs.concept.uuid === PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'] &&
              obs.value &&
              typeof obs.value === 'string' &&
              obs.value.startsWith('Time:'),
          );

          if (hourObs && typeof hourObs.value === 'string') {
            const hourMatch = hourObs.value.match(/Hour:\s*([0-9.]+)/);
            if (hourMatch) {
              hour = parseFloat(hourMatch[1]) || 0;
            }
          }

          if (timeObs && typeof timeObs.value === 'string') {
            const timeMatch = timeObs.value.match(/Time:\s*(.+)/);
            if (timeMatch) {
              time = timeMatch[1].trim();
            }
          }

          const entry = {
            id: `fhr-${fetalHeartRateObs.uuid}`,
            uuid: fetalHeartRateObs.uuid,
            encounterUuid: encounter.uuid,
            fetalHeartRate: parseFloat(fetalHeartRateObs.value) || 0,
            hour,
            time,
            date: encounterDatetime.toLocaleDateString(),
            encounterDatetime: encounterDatetime.toISOString(),
            obsDatetime: fetalHeartRateObs.obsDatetime,
          };

          fetalHeartRateEntries.push(entry);
        }
      }

      const sortedEntries = fetalHeartRateEntries.sort(
        (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
      );

      return sortedEntries;
    } catch (error) {
      console.error('Error processing fetal heart rate data:', error);
      return [];
    }
  }, [data]);

  return {
    fetalHeartRateData,
    isLoading,
    error,
    mutate,
  };
}

// Function to save fetal heart rate data to OpenMRS
export async function saveFetalHeartRateData(
  patientUuid: string,
  formData: { hour: number; time: string; fetalHeartRate: number },
  locationUuid?: string,
  providerUuid?: string,
) {
  try {
    const result = await createPartographyEncounter(
      patientUuid,
      'fetal-heart-rate',
      formData,
      locationUuid,
      providerUuid,
    );

    return result;
  } catch (error) {
    console.error('Error saving fetal heart rate data:', error);
    return {
      success: false,
      message: error?.message || 'Failed to save fetal heart rate data',
    };
  }
}

// Function to save drug order data to OpenMRS
export async function saveDrugOrderData(
  patientUuid: string,
  formData: {
    drugName: string;
    dosage: string;
    route: string;
    frequency: string;
  },
  locationUuid?: string,
  providerUuid?: string,
  signal?: AbortSignal,
) {
  try {
    const result = await createPartographyEncounter(
      patientUuid,
      'drugs-fluids',
      formData,
      locationUuid,
      providerUuid,
      signal,
    );
    return result;
  } catch (error) {
    console.error('Error saving drug order data:', error);
    return {
      success: false,
      message: error?.message || 'Failed to save drug order data',
    };
  }
}

export function useDrugOrders(patientUuid: string) {
  const apiUrl = patientUuid
    ? `${restBaseUrl}/order?patient=${patientUuid}&orderType=131168f4-15f5-102d-96e4-000c29c2a5d7&v=full&limit=50`
    : null;

  const { data, error, isLoading, mutate } = useSWR(apiUrl, openmrsFetch);

  const drugOrders = useMemo(() => {
    const responseData = data?.data as any;

    if (!responseData?.results || !Array.isArray(responseData.results)) {
      return [];
    }

    const allOrders = responseData.results;
    const activeOrders = allOrders
      .filter((order: any) => order.action === 'NEW' && !order.dateStopped)
      .sort((a: any, b: any) => {
        const dateA = a.dateActivated ? new Date(a.dateActivated).getTime() : 0;
        const dateB = b.dateActivated ? new Date(b.dateActivated).getTime() : 0;
        return dateB - dateA;
      });

    const processedOrders = activeOrders.map((order: any) => {
      const processed = {
        id: order.uuid,
        drugName: order.drug?.display || order.drugNonCoded || 'Unknown Drug',
        dosage: `${order.dose || ''} ${order.doseUnits?.display || ''}`.trim(),
        route: order.route?.display || '',
        frequency: order.frequency?.display || '',
        date: order.dateActivated ? new Date(order.dateActivated).toLocaleDateString() : '',
        orderNumber: order.orderNumber,
        display: order.display,
        quantity: order.quantity,
        duration: order.duration,
        durationUnits: order.durationUnits?.display,
        asNeeded: order.asNeeded,
        instructions: order.instructions,
        orderer: order.orderer?.display,
      };
      return processed;
    });

    return processedOrders;
  }, [data]);

  return {
    drugOrders,
    isLoading,
    error,
    mutate,
  };
}
