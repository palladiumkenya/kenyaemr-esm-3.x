import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

const PARTOGRAPHY_CONCEPTS = {
  'fetal-heart-rate': '1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'cervical-dilation': '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'descent-of-head': '1810AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'uterine-contractions': '163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'uterine-contraction-frequency': '166529AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'uterine-contraction-duration': '159368AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'maternal-pulse': '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'systolic-bp': '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'diastolic-bp': '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  temperature: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'protein-level': '161442AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'glucose-level': '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'ketone-level': '165438AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'urine-volume': '159660AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'urine-characteristics': '56AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  medication: '1282AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'medication-name': '164231AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'oxytocin-dose': '166531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'iv-fluids': '161911AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  dosage: '1443AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'event-type': '162879AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'event-description': '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'amniotic-fluid': '162653AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  moulding: '166527AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'blood-group': '300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'time-slot': '163286AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'labor-pattern': '164135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'hours-since-rupture': '167149AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'ruptured-membranes': '164900AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'date-of-admission': '1640AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'gestation-weeks': '1789AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'estimated-delivery-date': '5596AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'last-menstrual-period': '1427AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

const PARTOGRAPHY_ENCOUNTER_TYPES = {
  'fetal-heart-rate': '022d62af-e2a5-4282-953b-52dd5cba3296',
  'cervical-dilation': '022d62af-e2a5-4282-953b-52dd5cba3296',
  'descent-of-head': '022d62af-e2a5-4282-953b-52dd5cba3296',
  'uterine-contractions': '022d62af-e2a5-4282-953b-52dd5cba3296',
  'maternal-pulse': '022d62af-e2a5-4282-953b-52dd5cba3296',
  'blood-pressure': '022d62af-e2a5-4282-953b-52dd5cba3296',
  temperature: '022d62af-e2a5-4282-953b-52dd5cba3296',
  'urine-analysis': '022d62af-e2a5-4282-953b-52dd5cba3296',
  'drugs-fluids': '022d62af-e2a5-4282-953b-52dd5cba3296',
  'progress-events': '022d62af-e2a5-4282-953b-52dd5cba3296',
};

interface OpenMRSResponse<T> {
  results: T[];
}

export interface PartographyObservation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
  };
  value: string | number;
  obsDatetime: string;
  encounter: {
    uuid: string;
    encounterType: {
      uuid: string;
      display: string;
    };
  };
}

export interface PartographyEncounter {
  uuid: string;
  encounterDatetime: string;
  encounterType: {
    uuid: string;
    display: string;
  };
  obs: PartographyObservation[];
}

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

  const partographyPatterns = [
    'mch-partograph',
    'partography',
    'fetal-monitoring',
    'maternal-monitoring',
    'obstetric-vitals',
    'labor-monitoring',
    'labour-monitoring',
  ];

  for (const pattern of partographyPatterns) {
    if (availableTypes[pattern]) {
      return availableTypes[pattern];
    }
  }

  const fallbackMapping = {
    'fetal-heart-rate': ['mch-mother-consultation', 'vitals', 'obstetric', 'maternal', 'consultation', 'clinical'],
    'cervical-dilation': ['mch-mother-consultation', 'obstetric', 'maternal', 'consultation', 'clinical'],
    'maternal-pulse': ['vitals', 'maternal', 'consultation', 'clinical'],
    'blood-pressure': ['vitals', 'maternal', 'consultation', 'clinical'],
    temperature: ['vitals', 'consultation', 'clinical'],
    'urine-analysis': ['vitals', 'laboratory', 'consultation', 'clinical'],
    'drugs-fluids': ['medication', 'treatment', 'consultation', 'clinical'],
    'progress-events': ['obstetric', 'maternal', 'consultation', 'clinical'],
  };

  const fallbacks = fallbackMapping[graphType] || ['consultation', 'clinical'];

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
  const { data, error, isLoading, mutate } = useSWR(
    patientUuid ? `partography_encounters_${patientUuid}_${graphType}` : null,
    async () => {
      const encounterTypeUuid = await getEncounterTypeForGraph(graphType);

      if (!encounterTypeUuid) {
        return { data: { results: [] } };
      }

      const apiUrl = `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${encounterTypeUuid}&v=full`;

      const response = await openmrsFetch(apiUrl);

      if (response.ok) {
        const responseData = await response.json();
        return { data: responseData };
      } else {
        return { data: { results: [] } };
      }
    },
  );

  const encounters = (data?.data as OpenMRSResponse<PartographyEncounter>)?.results ?? [];

  return {
    encounters,
    isLoading,
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
    const storageKey = `partography_${patientUuid}_${graphType}`;
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
): Promise<{ success: boolean; message: string; encounter?: PartographyEncounter }> {
  try {
    const observations = buildObservations(graphType, formData);

    if (observations.length === 0) {
      throw new Error('No valid observations to save');
    }

    const encounterTypeUuid = await getEncounterTypeForGraph(graphType);
    if (!encounterTypeUuid) {
      throw new Error(`No encounter type found for graph: ${graphType}`);
    }

    const finalLocationUuid = locationUuid || '1';

    const encounterDatetime = new Date(Date.now() - 5 * 60 * 1000).toISOString();

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
              encounterRole: 'a0b03050-c99b-11e0-9572-0800200c9a66',
              voided: false,
            },
          ];
        }
      } catch (validationError) {}
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

            if (
              detailedError.error &&
              detailedError.error.fieldErrors &&
              detailedError.error.fieldErrors.encounterType
            ) {
              const availableTypes = await discoverEncounterTypes();
              const fallbackTypes = ['vitals', 'consultation', 'clinical'];
              let retryEncounterType = null;

              for (const fallback of fallbackTypes) {
                if (availableTypes[fallback]) {
                  retryEncounterType = availableTypes[fallback];
                  break;
                }
              }

              if (!retryEncounterType && Object.keys(availableTypes).length > 0) {
                retryEncounterType = Object.values(availableTypes)[0];
              }

              if (retryEncounterType) {
                const retryPayload = { ...encounterPayload, encounterType: retryEncounterType };
                const retryResponse = await openmrsFetch(`${restBaseUrl}/encounter`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(retryPayload),
                });

                if (retryResponse.ok) {
                  const encounter = await retryResponse.json();

                  try {
                    await saveToLocalStorage(patientUuid, graphType, formData, encounter.uuid);
                  } catch (localError) {}

                  return {
                    success: true,
                    message: 'Partography data saved successfully to OpenMRS (with fallback encounter type)',
                    encounter,
                  };
                }
              }
            }

            const isProviderConstraintError =
              (detailedError.error.fieldErrors && detailedError.error.fieldErrors.encounterProviders) ||
              (detailedError.error.message && detailedError.error.message.includes('provider_id'));

            if (isProviderConstraintError) {
              const retryPayloadWithoutProvider = { ...encounterPayload };
              delete retryPayloadWithoutProvider.encounterProviders;

              const retryResponse = await openmrsFetch(`${restBaseUrl}/encounter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(retryPayloadWithoutProvider),
              });

              if (retryResponse.ok) {
                const encounter = await retryResponse.json();

                try {
                  await saveToLocalStorage(patientUuid, graphType, formData, encounter.uuid);
                } catch (localError) {}

                return {
                  success: true,
                  message: 'Partography data saved successfully to OpenMRS (without provider constraints)',
                  encounter,
                };
              }
            }

            if (detailedError.error.fieldErrors && detailedError.error.fieldErrors.encounterDatetime) {
              const earlierDatetime = new Date(Date.now() - 60 * 60 * 1000).toISOString();
              const retryPayload = { ...encounterPayload, encounterDatetime: earlierDatetime };

              const retryResponse = await openmrsFetch(`${restBaseUrl}/encounter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(retryPayload),
              });

              if (retryResponse.ok) {
                const encounter = await retryResponse.json();

                try {
                  await saveToLocalStorage(patientUuid, graphType, formData, encounter.uuid);
                } catch (localError) {}

                return {
                  success: true,
                  message: 'Partography data saved successfully to OpenMRS (with adjusted datetime)',
                  encounter,
                };
              }
            }

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

    const cacheKey = `partography_encounters_${patientUuid}_${graphType}`;
    try {
      const { mutate: globalMutate } = await import('swr');
      await globalMutate(cacheKey);
      setTimeout(async () => {
        await globalMutate(cacheKey);
      }, 1000);
    } catch (mutateError) {}

    try {
      await saveToLocalStorage(patientUuid, graphType, formData, encounter.uuid);
    } catch (localError) {}

    return {
      success: true,
      message: 'Partography data saved successfully to OpenMRS',
      encounter,
    };
  } catch (error) {
    try {
      await saveToLocalStorage(patientUuid, graphType, formData);
      return {
        success: true,
        message: 'Partography data saved to local storage (OpenMRS unavailable)',
      };
    } catch (localError) {
      return {
        success: false,
        message: `Failed to save partography data: ${error.message}`,
      };
    }
  }
}

async function saveToLocalStorage(
  patientUuid: string,
  graphType: string,
  formData: any,
  encounterUuid?: string,
): Promise<void> {
  const entryId = encounterUuid || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  const dataEntry = {
    id: entryId,
    timestamp,
    graphType,
    data: formData,
    encounterUuid,
  };

  const storageKey = `partography_${patientUuid}_${graphType}`;
  const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');

  existingData.push(dataEntry);

  if (existingData.length > 100) {
    existingData.splice(0, existingData.length - 100);
  }

  localStorage.setItem(storageKey, JSON.stringify(existingData));
}

function buildObservations(graphType: string, formData: any): any[] {
  const observations = [];
  const obsDatetime = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  switch (graphType) {
    case 'fetal-heart-rate':
      if (formData.value || formData.measurementValue) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['fetal-heart-rate'],
          value: parseFloat(formData.value || formData.measurementValue),
          obsDatetime,
        });
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
      if (formData.value || formData.measurementValue) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['uterine-contractions'],
          value: parseFloat(formData.value || formData.measurementValue),
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
      break;

    case 'drugs-fluids':
      if (formData.medication) {
        observations.push({
          concept: PARTOGRAPHY_CONCEPTS['medication'],
          value: formData.medication,
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
                group: getGroupNameForGraph(graphType),
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

          switch (conceptUuid) {
            case PARTOGRAPHY_CONCEPTS['fetal-heart-rate']:
              if (graphType === 'fetal-heart-rate') {
                value = parseFloat(obs.value as string);
                groupName = 'Fetal Heart Rate';
              }
              break;
            case PARTOGRAPHY_CONCEPTS['cervical-dilation']:
              if (graphType === 'cervical-dilation') {
                value = parseFloat(obs.value as string);
                groupName = 'Cervical Dilation';
              }
              break;
            case PARTOGRAPHY_CONCEPTS['descent-of-head']:
              if (graphType === 'descent-of-head') {
                const stationMapping = {
                  '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 0,
                  '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 1,
                  '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 2,
                  '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 3,
                  '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 4,
                  '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 5,
                };
                value = stationMapping[obs.value as string] ?? parseFloat(obs.value as string);
                groupName = 'Descent of Head';
              }
              break;
            case PARTOGRAPHY_CONCEPTS['uterine-contractions']:
              if (graphType === 'uterine-contractions') {
                value = parseFloat(obs.value as string);
                groupName = 'Uterine Contractions';
              }
              break;
            case PARTOGRAPHY_CONCEPTS['maternal-pulse']:
              if (graphType === 'maternal-pulse') {
                value = parseFloat(obs.value as string);
                groupName = 'Maternal Pulse';
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
                groupName = 'Temperature';
              }
              break;
            default:
              if (typeof obs.value === 'number' || !isNaN(parseFloat(obs.value as string))) {
                value = parseFloat(obs.value as string);
                groupName = getGroupNameForGraph(graphType);
              }
              break;
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

  return chartData.sort(
    (a, b) => new Date(`1970-01-01T${a.time}`).getTime() - new Date(`1970-01-01T${b.time}`).getTime(),
  );
}

function getGroupNameForGraph(graphType: string): string {
  const groupNames = {
    'fetal-heart-rate': 'Fetal Heart Rate',
    'cervical-dilation': 'Cervical Dilation',
    'descent-of-head': 'Descent of Head',
    'uterine-contractions': 'Uterine Contractions',
    'maternal-pulse': 'Maternal Pulse',
    'blood-pressure': 'Blood Pressure',
    temperature: 'Temperature',
    'urine-analysis': 'Urine Analysis',
    'drugs-fluids': 'Drugs & Fluids',
    'progress-events': 'Progress & Events',
  };

  return groupNames[graphType] || graphType.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function createTestPartographyData(patientUuid: string) {
  const testGraphTypes = ['fetal-heart-rate', 'cervical-dilation', 'maternal-pulse', 'temperature', 'blood-pressure'];

  testGraphTypes.forEach(async (graphType, index) => {
    const sampleDataPoints = [
      { value: 120 + index * 10, time: '10:00' },
      { value: 125 + index * 10, time: '11:00' },
      { value: 130 + index * 10, time: '12:00' },
      { value: 128 + index * 10, time: '13:00' },
    ];

    for (const dataPoint of sampleDataPoints) {
      const formData =
        graphType === 'blood-pressure'
          ? { systolic: dataPoint.value, diastolic: dataPoint.value - 40, time: dataPoint.time }
          : { value: dataPoint.value, time: dataPoint.time };

      try {
        await saveToLocalStorage(patientUuid, graphType, formData);
      } catch (error) {}
    }
  });
}

export function transformEncounterToTableData(encounters: PartographyEncounter[], graphType: string): any[] {
  const tableData = [];

  const getUnitForGraphType = (type: string): string => {
    const units = {
      'fetal-heart-rate': 'BPM',
      'blood-pressure': 'mmHg',
      'maternal-pulse': 'BPM',
      temperature: '°C',
      'cervical-dilation': 'cm',
      'descent-of-head': 'Station',
      'uterine-contractions': 'per 10min',
      'urine-analysis': 'Level',
      'drugs-fluids': 'ml/hr',
      'progress-events': 'Value',
    };
    return units[type] || '';
  };

  const mapObservationToGraphType = (obs: any, targetGraphType: string): boolean => {
    const conceptMappings = {
      'fetal-heart-rate': ['1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      'blood-pressure': ['5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      'maternal-pulse': ['5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      temperature: ['5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      'cervical-dilation': ['162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      'descent-of-head': ['1810AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      'uterine-contractions': ['163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      'urine-analysis': [
        '161442AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '165438AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      ],
      'drugs-fluids': ['1282AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '161911AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
      'progress-events': [
        '162879AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      ],
    };

    const conceptUuids = conceptMappings[targetGraphType] || [];
    return conceptUuids.includes(obs.concept?.uuid);
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
                const stationDisplayMapping = {
                  '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '0/5',
                  '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '1/5',
                  '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '2/5',
                  '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '3/5',
                  '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '4/5',
                  '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '5/5',
                };

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

                displayValue = stationDisplayMapping[valueToMap] || valueToMap;
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
          let conceptName = obs.concept?.display || 'Unknown';
          let unit = getUnitForGraphType(graphType);

          if (graphType === 'progress-events') {
            switch (obs.concept?.uuid) {
              case '1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
                conceptName = 'Fetal Heart Rate';
                unit = 'BPM';
                break;
              case '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
                conceptName = 'Cervical Dilation';
                unit = 'cm';
                break;
              case '163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
                conceptName = 'Uterine Contractions';
                unit = 'per 10min';
                break;
              default:
                conceptName = obs.concept?.display || 'Progress Event';
                break;
            }
          }

          let displayValue;
          if (graphType === 'descent-of-head') {
            const stationDisplayMapping = {
              '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '0/5',
              '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '1/5',
              '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '2/5',
              '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '3/5',
              '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '4/5',
              '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': '5/5',
            };

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

            displayValue = stationDisplayMapping[valueToMap] || valueToMap;
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
