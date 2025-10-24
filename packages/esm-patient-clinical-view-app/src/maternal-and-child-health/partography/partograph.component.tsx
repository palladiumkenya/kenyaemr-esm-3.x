import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layer,
  Grid,
  Column,
  Tag,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
} from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import { LineChart } from '@carbon/charts-react';
import { useSession, useLayoutType, openmrsFetch } from '@openmrs/esm-framework';
import '@carbon/charts/styles.css';
import styles from './partography.scss';
import PartographyDataForm from './partography-data-form.component';
import {
  CervixForm,
  FetalHeartRateForm,
  CervicalContractionsForm,
  OxytocinForm,
  DrugsIVFluidsForm,
  TemperatureForm,
  UrineTestForm,
} from './forms';
import {
  FetalHeartRateGraph,
  MembraneAmnioticFluidGraph,
  CervicalContractionsGraph,
  OxytocinGraph,
  DrugsIVFluidsGraph,
  PulseBPGraph,
  TemperatureGraph,
  UrineTestGraph,
} from './graphs';
import MembraneAmnioticFluidForm from './forms/membrane-amniotic-fluid-form.component';
import {
  saveMembraneAmnioticFluidData,
  createPartographyEncounter,
  transformEncounterToChartData,
  transformEncounterToTableData,
  useDrugOrders,
  useFetalHeartRateData,
  usePartographyData,
} from './partography.resource';
import { saveCervixFormData, useCervixFormData } from './forms/useCervixData';
import {
  getTranslatedPartographyGraphs,
  getPartographyTableHeaders,
  getColorForGraph,
  PARTOGRAPHY_CONCEPTS,
  URINE_LEVEL_OPTIONS,
} from './types/index';
import { useOxytocinData, saveOxytocinFormData } from './resources/oxytocin.resource';
import { useMembraneAmnioticFluidData } from './resources/membrane-amniotic-fluid.resource';

enum ScaleTypes {
  LABELS = 'labels',
  LINEAR = 'linear',
}

// --- INLINE TYPE DEFINITIONS ADDED FOR CONTEXT ---
type GraphDefinition = {
  id: string;
  title: string;
  color: string;
  yAxisLabel: string;
  yMin: number;
  yMax: number;
  normalRange: string;
  description: string;
};

type ChartDataPoint = {
  hour: number;
  time?: string;
  group: string;
  value: number;
};
// --- END INLINE TYPE DEFINITIONS ---

// --- CERVIX CHART OPTIONS: MEDICAL PARTOGRAPH STYLING ---
const CERVIX_CHART_OPTIONS = {
  axes: {
    bottom: {
      title: '', // Remove Hours label completely
      mapsTo: 'hour',
      scaleType: ScaleTypes.LINEAR,
      domain: [0, 10],
      tick: {
        count: 21, // Force exactly 21 ticks for all 30-min intervals
        rotation: 0,
        values: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10], // Explicit 30-min intervals
        formatter: (hour) => {
          // Format as hours with 30-minute intervals
          if (hour === 0) {
            return '0';
          } else if (hour === 0.5) {
            return '0.30';
          } else if (hour % 1 === 0) {
            return `${hour}`;
          } else if (hour % 1 === 0.5) {
            return `${Math.floor(hour)}.30`;
          } else {
            return `${hour}`;
          }
        },
      },
      grid: {
        enabled: true,
        strokeWidth: 1,
        strokeDasharray: '2,2',
      },
    },
    left: {
      title: 'Cervical Dilation (cm) / Descent of Head (5=high → 1=descended)',
      mapsTo: 'value',
      domain: [0, 10],
      ticks: {
        values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        formatter: (value) => {
          // Show both cervical dilation and descent of head values
          // Direct mapping: 5=high position, 1=most descended
          if (value >= 1 && value <= 5) {
            return `${value}cm / D${value}`;
          } else if (value === 0) {
            return '0cm';
          } else {
            return `${value}cm`;
          }
        },
      },
      scaleType: ScaleTypes.LINEAR,
      grid: {
        enabled: true,
        strokeWidth: 1,
        strokeDasharray: '2,2',
      },
    },
  },
  points: {
    enabled: true,
    radius: 6,
    strokeWidth: 2,
    fill: true,
  },
  curve: 'curveLinear',
  height: '500px',
  grid: {
    x: {
      enabled: true,
      strokeWidth: 1,
      strokeDasharray: '2,2',
    },
    y: {
      enabled: true,
      strokeWidth: 1,
      strokeDasharray: '2,2',
    },
  },
  theme: 'white',
  toolbar: {
    enabled: false,
  },
  legend: {
    position: 'top',
    clickable: false,
  },
};
// --- END CERVIX CHART OPTIONS ---

type PartographyProps = {
  patientUuid: string;
};

// Skeleton Components for Loading States with inline animation
const GraphSkeleton: React.FC = () => {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f4f4f4 25%, #e0e0e0 50%, #f4f4f4 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.5s infinite ease-in-out',
    borderRadius: '4px',
  };

  // Add keyframes to head if not already added
  React.useEffect(() => {
    if (!document.querySelector('#skeleton-keyframes')) {
      const style = document.createElement('style');
      style.id = 'skeleton-keyframes';
      style.textContent = `
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
      }}>
      <div
        style={{
          height: '500px',
          ...skeletonStyle,
          marginBottom: '1rem',
        }}
      />
      {/* Skeleton for custom time labels (cervix specific) */}
      <div style={{ marginTop: '1rem', borderTop: '1px solid #e0e0e0', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
          {Array.from({ length: 11 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: index === 0 ? '60px' : '60px',
                height: '20px',
                flex: index === 0 ? 'none' : '1',
                ...skeletonStyle,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {Array.from({ length: 11 }).map((_, index) => (
            <div
              key={index}
              style={{
                width: index === 0 ? '60px' : '60px',
                height: '20px',
                flex: index === 0 ? 'none' : '1',
                ...skeletonStyle,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
        <div style={{ width: '100px', height: '24px', ...skeletonStyle }} />
        <div style={{ width: '120px', height: '24px', ...skeletonStyle }} />
      </div>
    </div>
  );
};

const TableSkeleton: React.FC = () => {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f4f4f4 25%, #e0e0e0 50%, #f4f4f4 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.5s infinite ease-in-out',
    borderRadius: '4px',
  };

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
      }}>
      <div style={{ width: '200px', height: '24px', marginBottom: '1rem', ...skeletonStyle }} />
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '150px', height: '20px', ...skeletonStyle }} />
          <div style={{ width: '80px', height: '20px', ...skeletonStyle }} />
          <div style={{ width: '60px', height: '20px', ...skeletonStyle }} />
        </div>
      ))}
      <div style={{ width: '180px', height: '20px', marginTop: '1rem', ...skeletonStyle }} />
    </div>
  );
};

const Partograph: React.FC<PartographyProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  // Development flag to enable dummy data (set to false for production)
  const ENABLE_DUMMY_DATA = false;

  // Local state for regular partography data (not saved to OpenMRS yet)
  const [localPartographyData, setLocalPartographyData] = useState<Record<string, any[]>>({});

  // Local state for fetal heart rate data
  const [localFetalHeartRateData, setLocalFetalHeartRateData] = useState<
    Array<{
      hour: number;
      value: number;
      group: string;
      time?: string;
    }>
  >([]);

  // Backend membrane amniotic fluid data
  const {
    membraneAmnioticFluidEntries,
    isLoading: isMembraneAmnioticFluidLoading,
    error: membraneAmnioticFluidError,
    mutate: mutateMembraneAmnioticFluidData,
  } = useMembraneAmnioticFluidData(patientUuid || '');

  // Cervical contractions backend data
  const {
    data: cervicalContractionsData,
    isLoading: isCervicalContractionsLoading,
    mutate: mutateCervicalContractions,
  } = usePartographyData(patientUuid || '', 'uterine-contractions');

  // Oxytocin backend data
  const {
    oxytocinData: loadedOxytocinData,
    existingOxytocinEntries,
    isLoading: isOxytocinDataLoading,
    error: oxytocinDataError,
    mutate: mutateOxytocinData,
  } = useOxytocinData(patientUuid || '');

  // Drugs and IV Fluids state
  const [localDrugsIVFluidsData, setLocalDrugsIVFluidsData] = useState<
    Array<{
      drugName: string;
      dosage: string;
      route?: string;
      frequency?: string;
      date?: string;
      id?: string;
    }>
  >([]);

  // Pulse and BP backend data
  const {
    data: loadedPulseData,
    isLoading: isPulseDataLoading,
    error: pulseDataError,
    mutate: mutatePulseData,
  } = usePartographyData(patientUuid || '', 'maternal-pulse');
  const {
    data: loadedBPData,
    isLoading: isBPDataLoading,
    error: bpDataError,
    mutate: mutateBPData,
  } = usePartographyData(patientUuid || '', 'blood-pressure');

  // Temperature backend data
  const {
    data: loadedTemperatureData,
    isLoading: isTemperatureDataLoading,
    error: temperatureDataError,
    mutate: mutateTemperatureData,
  } = usePartographyData(patientUuid || '', 'temperature');

  // Urine Test backend data
  const {
    data: urineTestEncounters = [],
    isLoading: isUrineTestLoading,
    error: urineTestError,
    mutate: mutateUrineTestData,
  } = usePartographyData(patientUuid || '', 'urine-analysis');

  // Transform backend urine test data to UrineTestData[]
  const urineTestData = useMemo(() => {
    // Map coded values to +/++/+++ for protein/acetone
    const codeToPlus = (code) => {
      switch (code) {
        case '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
        case 'ZERO':
        case '0':
          return '0';
        case '1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
        case 'ONE PLUS':
        case '+':
          return '+';
        case '1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
        case 'TWO PLUS':
        case '++':
          return '++';
        case '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
        case 'THREE PLUS':
        case '+++':
          return '+++';
        default:
          return code;
      }
    };
    return (urineTestEncounters || []).map((encounter, index) => {
      const obs = encounter.obs || [];
      // Helper to get obs value by concept
      const getObsValue = (conceptUuid) => {
        const found = obs.find((o) => o.concept.uuid === conceptUuid);
        if (!found) return '';
        const v = found.value;
        if (v && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, 'display')) {
          // @ts-ignore
          return v.display ?? '';
        }
        return v != null ? String(v) : '';
      };
      // Helper to get time from description obs
      const getTime = () => {
        const timeObs = obs.find(
          (o) =>
            o.concept.uuid === PARTOGRAPHY_CONCEPTS['fetal-heart-rate-time'] &&
            typeof o.value === 'string' &&
            o.value.startsWith('Time:'),
        );
        if (timeObs && typeof timeObs.value === 'string') {
          const match = timeObs.value.match(/Time:\s*(.+)/);
          if (match) return match[1].trim();
        }
        return '';
      };
      // Helper to get timeSlot from obs (look for concept with 'time-slot' or value with 'TimeSlot:')
      const getTimeSlot = () => {
        // Try concept for time-slot
        const slotObs = obs.find(
          (o) =>
            o.concept.uuid === PARTOGRAPHY_CONCEPTS['time-slot'] ||
            (typeof o.value === 'string' && o.value.startsWith('TimeSlot:')),
        );
        if (slotObs) {
          if (typeof slotObs.value === 'string') {
            const match = slotObs.value.match(/TimeSlot:\s*(.+)/);
            if (match) return match[1].trim();
            return slotObs.value;
          }
          return String(slotObs.value);
        }
        return '';
      };
      // Sample Collected and Result Returned: try to find obs with concept display or uuid containing 'collected' or 'returned'
      const getSampleCollected = () => {
        const found = obs.find(
          (o) =>
            (o.concept.display && o.concept.display.toLowerCase().includes('collected')) ||
            (o.concept.uuid && o.concept.uuid.toLowerCase().includes('collected')),
        );
        if (found) {
          return found.value != null ? String(found.value) : '';
        }
        return '';
      };
      const getResultReturned = () => {
        const found = obs.find(
          (o) =>
            (o.concept.display && o.concept.display.toLowerCase().includes('returned')) ||
            (o.concept.uuid && o.concept.uuid.toLowerCase().includes('returned')),
        );
        if (found) {
          return found.value != null ? String(found.value) : '';
        }
        return '';
      };
      // Get urine volume as string (not code), handle case-insensitive concept id
      const getVolume = () => {
        const found = obs.find(
          (o) =>
            (o.concept.uuid && o.concept.uuid.toLowerCase() === '159660aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') ||
            (o.concept.display && o.concept.display.toLowerCase().includes('volume')),
        );
        if (!found) {
          return '';
        }
        if (typeof found.value === 'number') {
          return String(found.value);
        }
        if (typeof found.value === 'string') {
          return found.value;
        }
        if (
          found.value &&
          typeof found.value === 'object' &&
          'display' in found.value &&
          typeof (found.value as { display?: unknown }).display === 'string'
        ) {
          return (found.value as { display: string }).display ?? '';
        }
        return '';
      };
      // Extract 'Time Slot: HH:mm' from event-description obs
      let timeSlot = '';
      const eventDescObs = obs.find(
        (o) =>
          o.concept.uuid === PARTOGRAPHY_CONCEPTS['event-description'] &&
          typeof o.value === 'string' &&
          o.value.startsWith('Time Slot: '),
      );
      if (eventDescObs && typeof eventDescObs.value === 'string') {
        const match = eventDescObs.value.match(/Time Slot: (\d{1,2}:\d{2})/);
        if (match) timeSlot = match[1];
      }
      // Ensure volume is a number if present, otherwise undefined
      let volumeRaw = getVolume();
      let volume: number | undefined = undefined;
      if (typeof volumeRaw === 'number') volume = volumeRaw;
      else if (typeof volumeRaw === 'string' && volumeRaw.trim() !== '' && !isNaN(Number(volumeRaw)))
        volume = Number(volumeRaw);
      const sampleCollected = getSampleCollected();
      const resultReturned = getResultReturned();
      // final row prepared
      return {
        id: `urine-test-${index}`,
        date: new Date(encounter.encounterDatetime).toLocaleDateString(),
        timeSlot,
        exactTime: getTime(),
        protein: codeToPlus(getObsValue(PARTOGRAPHY_CONCEPTS['protein-level'])),
        acetone: codeToPlus(getObsValue(PARTOGRAPHY_CONCEPTS['ketone-level'])),
        volume,
        timeSampleCollected: sampleCollected,
        timeResultsReturned: resultReturned,
      };
    });
  }, [urineTestEncounters]);

  const generateExtendedDummyData = () => {
    const baseTime = new Date();
    baseTime.setHours(8, 0, 0, 0);

    return Array.from({ length: 10 }, (_, i) => {
      const currentTime = new Date(baseTime);
      currentTime.setHours(currentTime.getHours() + i);

      const cervicalDilation = Math.min(3 + i * 0.8, 10);

      const descentOfHead = Math.max(5 - Math.floor(i * 0.5), 1);

      return {
        hour: i,
        time: currentTime.toTimeString().slice(0, 5),
        cervicalDilation: Math.round(cervicalDilation * 10) / 10,
        descentOfHead,
        entryDate: currentTime.toLocaleDateString(),
        entryTime: currentTime.toTimeString(),
      };
    });
  };

  // Load cervix data from OpenMRS
  const {
    cervixData: loadedCervixData,
    existingTimeEntries,
    existingCervixData,
    selectedHours,
    isLoading: isCervixDataLoading,
    error: cervixDataError,
    mutate: mutateCervixData,
  } = useCervixFormData(patientUuid || '');

  // Load fetal heart rate data from OpenMRS with null safety
  const {
    fetalHeartRateData: loadedFetalHeartRateData = [],
    isLoading: isFetalHeartRateLoading = false,
    error: fetalHeartRateError = null,
    mutate: mutateFetalHeartRateData = () => {},
  } = useFetalHeartRateData(patientUuid || '');

  // Fetch actual drug orders from OpenMRS
  const {
    drugOrders: loadedDrugOrders = [],
    isLoading: isDrugOrdersLoading = false,
    error: drugOrdersError = null,
    mutate: mutateDrugOrders = () => {},
  } = useDrugOrders(patientUuid || '');

  // Debug: Log drug orders data
  useEffect(() => {
    if (patientUuid) {
      // Drug orders status logged in development only

      if (drugOrdersError) {
        console.error('Drug Orders Error:', drugOrdersError);
      }
    }
  }, [patientUuid, loadedDrugOrders, isDrugOrdersLoading, drugOrdersError]);

  const session = useSession();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const controlSize = isTablet ? 'md' : 'sm';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCervixFormOpen, setIsCervixFormOpen] = useState(false);
  const [isFetalHeartRateFormOpen, setIsFetalHeartRateFormOpen] = useState(false);
  const [isMembraneAmnioticFluidFormOpen, setIsMembraneAmnioticFluidFormOpen] = useState(false);
  const [isCervicalContractionsFormOpen, setIsCervicalContractionsFormOpen] = useState(false);
  const [isOxytocinFormOpen, setIsOxytocinFormOpen] = useState(false);
  const [isTemperatureFormOpen, setIsTemperatureFormOpen] = useState(false);
  const [temperatureFormInitialTime, setTemperatureFormInitialTime] = useState<string>('');
  const [isUrineTestFormOpen, setIsUrineTestFormOpen] = useState(false);
  const [selectedGraphType, setSelectedGraphType] = useState<string>('');
  const [graphData, setGraphData] = useState<Record<string, ChartDataPoint[]>>({});
  const [viewMode, setViewMode] = useState<Record<string, 'graph' | 'table'>>({});
  const [fetalHeartRateViewMode, setFetalHeartRateViewMode] = useState<'graph' | 'table'>('graph');
  const [membraneAmnioticFluidViewMode, setMembraneAmnioticFluidViewMode] = useState<'graph' | 'table'>('graph');
  const [cervicalContractionsViewMode, setCervicalContractionsViewMode] = useState<'graph' | 'table'>('graph');
  const [oxytocinViewMode, setOxytocinViewMode] = useState<'graph' | 'table'>('graph');
  const [drugsIVFluidsViewMode, setDrugsIVFluidsViewMode] = useState<'graph' | 'table'>('graph');
  const [pulseBPViewMode, setPulseBPViewMode] = useState<'graph' | 'table'>('graph');
  const [temperatureViewMode, setTemperatureViewMode] = useState<'graph' | 'table'>('graph');
  const [urineTestViewMode, setUrineTestViewMode] = useState<'graph' | 'table'>('graph');
  const [fetalHeartRateCurrentPage, setFetalHeartRateCurrentPage] = useState(1);
  const [fetalHeartRatePageSize, setFetalHeartRatePageSize] = useState(5);
  const [membraneAmnioticFluidCurrentPage, setMembraneAmnioticFluidCurrentPage] = useState(1);
  const [membraneAmnioticFluidPageSize, setMembraneAmnioticFluidPageSize] = useState(5);
  const [cervicalContractionsCurrentPage, setCervicalContractionsCurrentPage] = useState(1);
  const [cervicalContractionsPageSize, setCervicalContractionsPageSize] = useState(5);
  const [oxytocinCurrentPage, setOxytocinCurrentPage] = useState(1);
  const [oxytocinPageSize, setOxytocinPageSize] = useState(5);
  const [drugsIVFluidsCurrentPage, setDrugsIVFluidsCurrentPage] = useState(1);
  const [pulseBPCurrentPage, setPulseBPCurrentPage] = useState(1);
  const [temperatureCurrentPage, setTemperatureCurrentPage] = useState(1);
  const [temperaturePageSize, setTemperaturePageSize] = useState(5);
  const [urineTestCurrentPage, setUrineTestCurrentPage] = useState(1);
  const [urineTestPageSize, setUrineTestPageSize] = useState(5);
  const [drugsIVFluidsPageSize, setDrugsIVFluidsPageSize] = useState(5);
  const [pulseBPPageSize, setPulseBPPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [pageSize, setPageSize] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Transform cervix data to match the existing format expected by the chart
  const cervixFormData = useMemo(() => {
    // Use OpenMRS data if available
    const dataToUse = loadedCervixData.length > 0 ? loadedCervixData : [];

    const processedData = dataToUse
      .map((data) => ({
        hour: data.hour || 0,
        time: data.time || '',
        cervicalDilation: data.cervicalDilation || 0,
        descentOfHead: data.descentOfHead || 0,
        entryDate: new Date(data.encounterDatetime).toLocaleDateString(),
        entryTime: new Date(data.encounterDatetime).toLocaleTimeString(),
      }))
      .filter((data) => data.hour > 0 && data.cervicalDilation > 0 && data.descentOfHead > 0);

    // Return dummy data if no processed data and dummy data is enabled, otherwise return processed data
    return processedData.length > 0 ? processedData : ENABLE_DUMMY_DATA ? generateExtendedDummyData() : [];
  }, [loadedCervixData, ENABLE_DUMMY_DATA]);

  // Compute existingTimeEntries from both local and OpenMRS data
  const computedExistingTimeEntries = useMemo(() => {
    // Use the existing time entries from OpenMRS only
    return existingTimeEntries;
  }, [existingTimeEntries]);

  // Compute combined fetal heart rate data from both local and OpenMRS sources
  const computedFetalHeartRateData = useMemo(() => {
    const combined = [...localFetalHeartRateData];

    // Add OpenMRS data if available and not already in local data
    if (loadedFetalHeartRateData?.length > 0) {
      loadedFetalHeartRateData.forEach((openMrsEntry) => {
        const exists = combined.find(
          (localEntry) => localEntry.hour === openMrsEntry.hour && localEntry.time === openMrsEntry.time,
        );

        if (!exists) {
          // Transform OpenMRS data to match local data structure
          const transformedEntry = {
            hour: openMrsEntry.hour,
            value: openMrsEntry.fetalHeartRate, // Map fetalHeartRate to value
            group: 'Fetal Heart Rate',
            time: openMrsEntry.time,
          };
          combined.push(transformedEntry);
        }
      });
    }

    // Sort by hour and time
    const sorted = combined.sort((a, b) => {
      if (a.hour !== b.hour) {
        return a.hour - b.hour;
      }
      return a.time.localeCompare(b.time);
    });

    return sorted;
  }, [localFetalHeartRateData, loadedFetalHeartRateData]);
  const partographGraphs: GraphDefinition[] = useMemo(
    () => getTranslatedPartographyGraphs(t) as GraphDefinition[],
    [t],
  );

  useEffect(() => {
    const initialViewMode = {};
    const initialCurrentPage = {};
    const initialPageSize = {};
    const initialLoading = {};

    partographGraphs.forEach((graph) => {
      initialViewMode[graph.id] = 'graph';
      initialCurrentPage[graph.id] = 1;
      initialPageSize[graph.id] = 5;
      initialLoading[graph.id] = true;
    });

    setViewMode(initialViewMode);
    setCurrentPage(initialCurrentPage);
    setPageSize(initialPageSize);
    setIsLoading(initialLoading);
  }, [partographGraphs]);

  const useGraphData = (graphType: string) => {
    const { data: encounters, isLoading, mutate } = usePartographyData(patientUuid || '', graphType);

    useEffect(() => {
      if (!isLoading) {
        let chartData: ChartDataPoint[] = [];

        // Special handling for pulse and BP combined encounters
        if (graphType === 'maternal-pulse' || graphType === 'blood-pressure') {
          // Collect all obs for pulse and BP from all encounters
          chartData = [];
          if (Array.isArray(encounters)) {
            encounters.forEach((encounter) => {
              if (Array.isArray(encounter.obs)) {
                const time = new Date(encounter.encounterDatetime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                encounter.obs.forEach((obs) => {
                  if (graphType === 'maternal-pulse' && obs.concept.uuid === PARTOGRAPHY_CONCEPTS['maternal-pulse']) {
                    chartData.push({
                      hour: 0,
                      group: 'Maternal Pulse',
                      time,
                      value: typeof obs.value === 'number' ? obs.value : parseFloat(obs.value),
                    });
                  }
                  if (graphType === 'blood-pressure') {
                    if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['systolic-bp']) {
                      chartData.push({
                        hour: 0,
                        group: 'Systolic',
                        time,
                        value: typeof obs.value === 'number' ? obs.value : parseFloat(obs.value),
                      });
                    }
                    if (obs.concept.uuid === PARTOGRAPHY_CONCEPTS['diastolic-bp']) {
                      chartData.push({
                        hour: 0,
                        group: 'Diastolic',
                        time,
                        value: typeof obs.value === 'number' ? obs.value : parseFloat(obs.value),
                      });
                    }
                  }
                });
              }
            });
          }
        } else if (localPartographyData[graphType] && localPartographyData[graphType].length > 0) {
          // Transform local data to chart format
          chartData = localPartographyData[graphType].map((item, index) => ({
            hour: index + 1, // Use index as hour for now
            group: graphType,
            time: item.time || `Point ${index + 1}`,
            value: item.value || item.measurementValue || 0,
          }));
        } else {
          chartData = transformEncounterToChartData(encounters, graphType);
        }

        if (chartData.length === 0 && ENABLE_DUMMY_DATA) {
          chartData = generateDummyDataForGraph(graphType);
        }

        setGraphData((prevData) => ({
          ...prevData,
          [graphType]: chartData,
        }));

        setIsLoading((prevLoading) => ({
          ...prevLoading,
          [graphType]: false,
        }));
      }
    }, [encounters, isLoading, graphType, localPartographyData]);

    return { encounters, isLoading, mutate };
  };

  // Function to generate dummy data for different graph types
  const generateDummyDataForGraph = (graphType: string): ChartDataPoint[] => {
    const baseTimeEntries = [
      { hour: 0, time: '08:00' },
      { hour: 1, time: '09:00' },
      { hour: 2, time: '10:00' },
      { hour: 3, time: '11:00' },
      { hour: 4, time: '12:00' },
      { hour: 5, time: '13:00' },
      { hour: 6, time: '14:00' },
    ];

    switch (graphType) {
      case 'fetal-heart-rate':
        return baseTimeEntries.map((entry) => ({
          hour: entry.hour,
          time: entry.time,
          group: 'Fetal Heart Rate',
          value: 140 + Math.random() * 20, // Normal range 120-160
        }));

      case 'maternal-pulse':
        return baseTimeEntries.map((entry) => ({
          hour: entry.hour,
          time: entry.time,
          group: 'Maternal Pulse',
          value: 75 + Math.random() * 15, // Normal range 60-100
        }));

      case 'blood-pressure':
        return [
          ...baseTimeEntries.map((entry) => ({
            hour: entry.hour,
            time: entry.time,
            group: 'Systolic',
            value: 115 + Math.random() * 10, // Normal systolic
          })),
          ...baseTimeEntries.map((entry) => ({
            hour: entry.hour,
            time: entry.time,
            group: 'Diastolic',
            value: 75 + Math.random() * 5, // Normal diastolic
          })),
        ];

      case 'temperature':
        return baseTimeEntries.map((entry) => ({
          hour: entry.hour,
          time: entry.time,
          group: 'Temperature',
          value: 36.5 + Math.random() * 0.8, // Normal range 36.5-37.3
        }));

      case 'uterine-contractions':
        return baseTimeEntries.map((entry) => ({
          hour: entry.hour,
          time: entry.time,
          group: 'Contractions per 10 minutes',
          value: Math.floor(Math.random() * 5) + 2, // 2-6 contractions
        }));

      default:
        return [];
    }
  };

  const cervixData = useGraphData('cervix');

  // Enable some data hooks for development/demo purposes
  // Remove duplicate declaration and broken object syntax

  // Apply custom styling for cervix chart lines after render
  useEffect(() => {
    const applyChartStyling = () => {
      const chartContainer = document.querySelector(`[data-chart-id="cervix"]`);
      if (chartContainer) {
        // Style the Alert and Action lines
        const svgPaths = chartContainer.querySelectorAll('svg path');
        svgPaths.forEach((path, index) => {
          const pathElement = path as SVGPathElement;
          // Check if this path represents Alert or Action line by checking its data
          const pathData = pathElement.getAttribute('d');
          if (pathData) {
            // Alert Line should start at hour 0
            if (pathData.includes('M0') || pathData.includes('L0')) {
              pathElement.style.stroke = '#FFD700'; // Yellow
              pathElement.style.strokeWidth = '3px';
              pathElement.style.strokeDasharray = '8,4';
            }
            // Action Line should start at hour 4
            else if (pathData.includes('M4') || pathData.includes('L4')) {
              pathElement.style.stroke = '#FF0000'; // Red
              pathElement.style.strokeWidth = '3px';
              pathElement.style.strokeDasharray = '8,4';
            }
          }
        });

        // Style cervical dilation points as X marks
        const svgCircles = chartContainer.querySelectorAll('svg circle');
        svgCircles.forEach((circle) => {
          const circleElement = circle as SVGCircleElement;
          // Check if this circle belongs to cervical dilation data
          const parentGroup = circleElement.closest('g');
          if (parentGroup) {
            // Look for cervical dilation color or class indicators
            const stroke = circleElement.getAttribute('stroke') || circleElement.style.stroke;
            const fill = circleElement.getAttribute('fill') || circleElement.style.fill;

            // If this is a cervical dilation point (green color), convert to X
            if (stroke === '#22C55E' || fill === '#22C55E') {
              // Hide the original circle
              circleElement.style.display = 'none';

              // Create X mark using two crossing lines
              const cx = parseFloat(circleElement.getAttribute('cx') || '0');
              const cy = parseFloat(circleElement.getAttribute('cy') || '0');
              const size = 6; // Size of the X mark

              const svg = circleElement.ownerSVGElement;
              if (svg) {
                // Create first line of X (top-left to bottom-right)
                const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line1.setAttribute('x1', (cx - size).toString());
                line1.setAttribute('y1', (cy - size).toString());
                line1.setAttribute('x2', (cx + size).toString());
                line1.setAttribute('y2', (cy + size).toString());
                line1.setAttribute('stroke', '#22C55E');
                line1.setAttribute('stroke-width', '3');
                line1.setAttribute('stroke-linecap', 'round');

                // Create second line of X (top-right to bottom-left)
                const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line2.setAttribute('x1', (cx + size).toString());
                line2.setAttribute('y1', (cy - size).toString());
                line2.setAttribute('x2', (cx - size).toString());
                line2.setAttribute('y2', (cy + size).toString());
                line2.setAttribute('stroke', '#22C55E');
                line2.setAttribute('stroke-width', '3');
                line2.setAttribute('stroke-linecap', 'round');

                // Insert the X lines after the circle
                parentGroup.appendChild(line1);
                parentGroup.appendChild(line2);
              }
            }
          }
        });
      }
    };

    const timer = setTimeout(applyChartStyling, 100);
    return () => clearTimeout(timer);
  }, [cervixFormData, isLoading, isCervixDataLoading]);

  // Patch: Add fetch/post logging for OpenMRS API

  // Wrap openmrsFetch to log all requests and responses
  function openmrsFetchWithLogging(url, options) {
    return openmrsFetch(url, options)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  // If patientUuid is not available, show a message to select a patient
  if (!patientUuid) {
    return (
      <div className={styles.partographyContainer}>
        <Layer>
          <Grid>
            <Column lg={16} md={8} sm={4}>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h4>{t('noPatientSelected', 'No patient selected')}</h4>
                <p>{t('selectPatientMessage', 'Please select a patient to view partography data.')}</p>
              </div>
            </Column>
          </Grid>
        </Layer>
      </div>
    );
  }

  // Show error if cervix data failed to load
  if (cervixDataError) {
    console.error('Error loading cervix data:', cervixDataError);
    // Continue rendering but show warning - don't block the entire UI
  }

  const handleAddDataPoint = (graphId: string) => {
    if (graphId === 'cervix') {
      setIsCervixFormOpen(true);
    } else {
      setSelectedGraphType(graphId);
      setIsFormOpen(true);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setIsLoading((prev) => ({
        ...prev,
        [formData.graphType]: true,
      }));

      // Add to local state instead of saving to OpenMRS
      const newEntry = {
        ...formData,
        timestamp: new Date(),
        id: Date.now(), // Simple ID for local data
      };

      setLocalPartographyData((prev) => ({
        ...prev,
        [formData.graphType]: [...(prev[formData.graphType] || []), newEntry],
      }));

      setIsFormOpen(false);
      setSelectedGraphType('');
    } catch (error) {
      alert(`Failed to add partography data: ${error.message}. Please try again.`);
    } finally {
      setIsLoading((prev) => ({
        ...prev,
        [formData.graphType]: false,
      }));
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedGraphType('');
  };

  const handleCervixFormClose = () => {
    setIsCervixFormOpen(false);
  };

  const handleCervixFormSubmit = async (formData: {
    hour: number;
    time: string;
    cervicalDilation: number;
    descentOfHead: number;
  }) => {
    // Validate data before adding to prevent NaN values
    if (
      isNaN(formData.hour) ||
      isNaN(formData.cervicalDilation) ||
      isNaN(formData.descentOfHead) ||
      !formData.time ||
      formData.time.trim() === ''
    ) {
      alert('Invalid data detected. Please ensure all fields are properly filled.');
      return;
    }

    if (
      formData.hour < 0 ||
      formData.hour > 23 ||
      formData.cervicalDilation < 0 ||
      formData.cervicalDilation > 10 ||
      formData.descentOfHead < 1 ||
      formData.descentOfHead > 5
    ) {
      alert('Values are outside acceptable medical ranges. Please check your inputs.');
      return;
    }

    const saveResult = await saveCervixFormData(
      patientUuid,
      {
        hour: String(formData.hour),
        time: formData.time,
        cervicalDilation: String(formData.cervicalDilation),
        descent: String(formData.descentOfHead), // direct numeric value
      },
      t,
      session?.currentProvider?.uuid,
      session?.sessionLocation?.uuid,
    );

    if (saveResult.success) {
      // Optionally refresh data from backend here
      if (typeof mutateCervixData === 'function') {
        mutateCervixData();
      }
      setIsCervixFormOpen(false);
    } else {
      alert('Failed to save data: ' + saveResult.message);
    }
  };

  const handleCervixDataSaved = () => {
    mutateCervixData(); // Refresh the cervix data from OpenMRS
  };

  // Fetal Heart Rate handlers
  const handleFetalHeartRateFormSubmit = (formData: { hour: number; time: string; fetalHeartRate: number }) => {
    // Validate data before adding
    if (isNaN(formData.hour) || isNaN(formData.fetalHeartRate) || !formData.time || formData.time.trim() === '') {
      alert('Invalid data detected. Please ensure all fields are properly filled.');
      return;
    }

    // Additional validation for reasonable values
    if (formData.hour < 0 || formData.hour > 24 || formData.fetalHeartRate < 80 || formData.fetalHeartRate > 200) {
      alert('Values are outside acceptable medical ranges. Please check your inputs.');
      return;
    }

    // Add to local state for immediate UI update
    const newEntry = {
      hour: formData.hour,
      value: formData.fetalHeartRate,
      group: 'Fetal Heart Rate',
      time: formData.time,
      date: new Date().toLocaleDateString(),
      id: `fhr-${Date.now()}`,
    };

    setLocalFetalHeartRateData((prev) => [...prev, newEntry]);
    setIsFetalHeartRateFormOpen(false);
  };

  // Callback for when fetal heart rate data is saved to OpenMRS
  const handleFetalHeartRateDataSaved = () => {
    mutateFetalHeartRateData(); // Refresh the fetal heart rate data from OpenMRS
  };

  const handleFetalHeartRateFormClose = () => {
    setIsFetalHeartRateFormOpen(false);
  };

  // Membrane Amniotic Fluid handlers
  const handleMembraneAmnioticFluidFormSubmit = async (formData: {
    timeSlot: string;
    exactTime: string;
    amnioticFluid: string;
    moulding: string;
  }) => {
    if (
      !formData.timeSlot ||
      !formData.exactTime ||
      !formData.amnioticFluid ||
      !formData.moulding ||
      formData.timeSlot.trim() === '' ||
      formData.exactTime.trim() === '' ||
      formData.amnioticFluid.trim() === '' ||
      formData.moulding.trim() === ''
    ) {
      alert('Invalid data detected. Please ensure all fields are properly filled.');
      return;
    }

    const saveResult = await saveMembraneAmnioticFluidData(
      patientUuid,
      {
        amnioticFluid: formData.amnioticFluid,
        moulding: formData.moulding,
        time: formData.exactTime,
      },
      t,
      session?.sessionLocation?.uuid,
      session?.currentProvider?.uuid,
    );
    await mutateMembraneAmnioticFluidData();
    setIsMembraneAmnioticFluidFormOpen(false);
  };

  const handleMembraneAmnioticFluidFormClose = () => {
    setIsMembraneAmnioticFluidFormOpen(false);
  };

  const handleCervicalContractionsFormSubmit = async (formData: {
    contractionLevel: string;
    contractionCount: string;
    timeSlot: string;
  }) => {
    const contractionLevelUuidMap: Record<string, string> = {
      none: '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      mild: '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      moderate: '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      strong: '166788AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    };
    const contractionLevel = formData.contractionLevel || 'none';
    const contractionLevelValue = contractionLevelUuidMap[contractionLevel];
    const contractionLevelUuid = contractionLevelValue; // For coded obs, concept and value are the same
    const contractionCountConcept = '159682AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    // Always send contractionCount as a number
    const contractionCount = parseInt(formData.contractionCount || '1', 10);
    const timeSlot = formData.timeSlot || new Date().toISOString().substring(11, 16);

    // Debug info removed for linting

    // Always send both obs: count (numeric) and level (coded)
    const encounterFormData = {
      contractionLevelValue, // UUID for level (none, mild, moderate, strong)
      contractionLevelUuid,
      contractionCount,
      contractionCountConcept,
      timeSlot,
    };
    // Payload prepared for submission
    try {
      const saveResult = await createPartographyEncounter(patientUuid, 'uterine-contractions', encounterFormData);
      if (saveResult.success) {
        if (typeof mutateCervicalContractions === 'function') {
          await mutateCervicalContractions();
        }
        setIsCervicalContractionsFormOpen(false);
      } else {
        console.error('Failed to save cervical contractions:', saveResult.message);
      }
    } catch (err) {
      console.error('Error during cervical contractions save:', err);
    }
  };

  const handleCervicalContractionsFormClose = () => {
    setIsCervicalContractionsFormOpen(false);
  };

  // Oxytocin handlers
  const handleOxytocinFormSubmit = async (formData: {
    oxytocinUsed: 'yes' | 'no';
    dropsPerMinute: number;
    timeSlot: string;
  }) => {
    // Validate data before saving
    if (!formData.timeSlot || formData.timeSlot.trim() === '') {
      alert('Time is required.');
      return;
    }
    if (
      formData.oxytocinUsed === 'yes' &&
      (isNaN(formData.dropsPerMinute) || formData.dropsPerMinute < 0 || formData.dropsPerMinute > 60)
    ) {
      alert('Drops per minute must be between 0 and 60 when oxytocin is used.');
      return;
    }

    if (formData.oxytocinUsed === 'yes') {
      try {
        const saveResult = await saveOxytocinFormData(
          patientUuid,
          {
            time: formData.timeSlot,
            dropsPerMinute: String(formData.dropsPerMinute),
          },
          t,
          session?.currentProvider?.uuid,
          session?.sessionLocation?.uuid,
        );

        if (saveResult.success) {
          if (typeof mutateOxytocinData === 'function') mutateOxytocinData();
          setIsOxytocinFormOpen(false);
        } else {
          alert('Failed to save oxytocin data: ' + saveResult.message);
        }
      } catch (err) {
        console.error('Error saving oxytocin data:', err);
        alert('Failed to save oxytocin data.');
      }
    } else {
      setIsOxytocinFormOpen(false);
    }
  };

  const handleOxytocinFormClose = () => {
    setIsOxytocinFormOpen(false);
  };

  // Drugs and IV Fluids handlers
  const handleDrugsIVFluidsFormSubmit = (formData: {
    drugName: string;
    dosage: string;
    route: string;
    frequency: string;
  }) => {
    // Validate data before adding
    if (!formData.drugName || !formData.dosage || formData.drugName.trim() === '' || formData.dosage.trim() === '') {
      alert('Invalid data detected. Please ensure all fields are properly filled.');
      return;
    }

    // Add to local state
    const newEntry = {
      drugName: formData.drugName,
      dosage: formData.dosage,
      route: formData.route,
      frequency: formData.frequency,
      date: new Date().toLocaleDateString(),
      id: `drugs-${Date.now()}`,
    };

    setLocalDrugsIVFluidsData((prev) => [...prev, newEntry]);
  };

  const handleDrugOrderDataSaved = () => {
    // Drug order data saved, refreshing drug orders...
    // Force refresh the drug orders data from OpenMRS
    mutateDrugOrders();
    // Also trigger a revalidation after a short delay
    setTimeout(() => {
      // Triggering second refresh...
      mutateDrugOrders();
    }, 2000);
  };

  // Pulse and BP handlers
  const handlePulseBPFormSubmit = async (formData: { pulse: number; systolicBP: number; diastolicBP: number }) => {
    if (!formData.pulse || !formData.systolicBP || !formData.diastolicBP) {
      alert('Invalid data detected. Please ensure all fields are properly filled.');
      return;
    }
    try {
      // Save both pulse and BP in a single encounter
      await createPartographyEncounter(patientUuid, 'pulse-bp-combined', {
        pulse: formData.pulse,
        systolic: formData.systolicBP,
        diastolic: formData.diastolicBP,
      });
      await mutatePulseData();
      await mutateBPData();
      // Force refresh of graph/table by toggling view mode
      setPulseBPViewMode((prev) => (prev === 'table' ? 'graph' : 'table'));
      setTimeout(() => setPulseBPViewMode('graph'), 0);
    } catch (error) {
      alert('Failed to save Pulse & BP data.');
    }
  };

  // Temperature backend save handler
  const handleTemperatureFormSubmit = async (formData: {
    timeSlot: string;
    exactTime: string;
    temperature: number;
  }) => {
    if (!formData.timeSlot || !formData.exactTime || !formData.temperature) {
      alert('Invalid data detected. Please ensure all fields are properly filled.');
      return;
    }
    // Save to backend
    try {
      await createPartographyEncounter(patientUuid, 'temperature', {
        value: formData.temperature,
        time: formData.exactTime,
      });
      await mutateTemperatureData();
      setIsTemperatureFormOpen(false);
    } catch (error) {
      alert('Failed to save temperature data.');
    }
  };

  const handleUrineTestFormSubmit = async (formData: {
    timeSlot: string;
    exactTime: string;
    protein: string;
    acetone: string;
    volume: number;
    timeSampleCollected: string;
    timeResultsReturned: string;
  }) => {
    // Validate data before adding
    if (
      !formData.timeSlot ||
      !formData.exactTime ||
      !formData.protein ||
      !formData.acetone ||
      !formData.volume ||
      !formData.timeSampleCollected ||
      !formData.timeResultsReturned
    ) {
      alert('Invalid data detected. Please ensure all fields are properly filled.');
      return;
    }

    // Map label to UUID for protein and acetone/ketone
    const labelToUuid = (label: string) => {
      switch (label) {
        case '0':
          return '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        case '+':
          return '1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        case '++':
          return '1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        case '+++':
          return '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        default:
          return label;
      }
    };

    try {
      // Get current time in HH:mm format
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      await createPartographyEncounter(patientUuid, 'urine-analysis', {
        proteinLevel: labelToUuid(formData.protein),
        ketoneLevel: labelToUuid(formData.acetone),
        volume: formData.volume,
        timeSampleCollected: formData.timeSampleCollected,
        timeResultsReturned: formData.timeResultsReturned,
        eventDescription: `Time Slot: ${currentTime}`,
      });
      setIsUrineTestFormOpen(false);
    } catch (error) {
      alert('Failed to save urine test data.');
    }
  };

  // Generate table data for membrane amniotic fluid from backend only
  const getMembraneAmnioticFluidTableData = () => {
    return membraneAmnioticFluidEntries.map((data, index) => ({
      id: data.id || `maf-${index}`,
      date: data.date,
      timeSlot: data.timeSlot || '',
      exactTime: data.time || '',
      amnioticFluid: data.amnioticFluid,
      moulding: data.moulding,
    }));
  };

  // Generate table data for fetal heart rate
  const getFetalHeartRateTableData = () => {
    return computedFetalHeartRateData.map((data, index) => {
      const getStatus = (value: number) => {
        if (value < 100) {
          return 'Low';
        }
        if (value >= 100 && value <= 180) {
          return 'Normal';
        }
        return 'High';
      };

      return {
        id: `fhr-${index}`,
        date: new Date().toLocaleDateString(),
        time: data.time || 'N/A',
        hour: `${data.hour}${data.hour % 1 === 0.5 ? '.5' : ''}hr`,
        value: `${data.value} bpm`,
        status: getStatus(data.value),
      };
    });
  };

  // Generate table data for cervical contractions
  const getCervicalContractionsTableData = () => {
    return cervicalContractionsData.map((encounter, index) => {
      // Find relevant obs for timeSlot, contractionCount, contractionLevel
      let timeSlot = '';
      let contractionCount = '';
      let contractionLevel = '';
      if (Array.isArray(encounter.obs)) {
        for (const obs of encounter.obs) {
          // TimeSlot is stored as a string value starting with 'Time:'
          if (
            obs.concept.uuid === '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' &&
            typeof obs.value === 'string' &&
            obs.value.startsWith('Time:')
          ) {
            const match = obs.value.match(/Time:\s*(.+)/);
            if (match) timeSlot = match[1].trim();
          }
          // Contraction count concept
          if (obs.concept.uuid === '159682AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
            contractionCount = String(obs.value);
          }
          // Contraction level concepts (none, mild, moderate, strong)
          if (
            obs.concept.uuid === '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' || // none
            obs.concept.uuid === '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' || // mild
            obs.concept.uuid === '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' || // moderate
            obs.concept.uuid === '166788AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' // strong
          ) {
            // Map UUID to label
            if (obs.concept.uuid === '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') contractionLevel = 'none';
            if (obs.concept.uuid === '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') contractionLevel = 'mild';
            if (obs.concept.uuid === '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') contractionLevel = 'moderate';
            if (obs.concept.uuid === '166788AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') contractionLevel = 'strong';
          }
        }
      }
      return {
        id: `cc-${index}`,
        date: new Date(encounter.encounterDatetime).toLocaleDateString(),
        timeSlot,
        contractionCount,
        contractionLevel,
      };
    });
  };

  // Generate table data for oxytocin (use backend data only)
  const getOxytocinTableData = () => {
    // Only map oxytocin-specific fields, do not include any event-description or urine test fields
    return loadedOxytocinData.map((data, index) => {
      // Defensive: Only use fields that are expected for oxytocin
      // If backend returns extra obs, ignore them
      return {
        id: `oxy-${index}`,
        date: data.encounterDatetime ? new Date(data.encounterDatetime).toLocaleDateString() : '',
        time: data.time || '',
        dropsPerMinute:
          data.dropsPerMinute !== null && data.dropsPerMinute !== undefined
            ? `${data.dropsPerMinute} drops/min`
            : 'N/A',
      };
    });
  };

  // Generate table data for drugs and IV fluids
  const getDrugsIVFluidsTableData = () => {
    // Combine loaded drug orders with local manual entries
    const drugOrdersData = loadedDrugOrders.map((order) => ({
      id: order.id,
      date: order.date,
      drugName: order.drugName,
      dosage: order.dosage,
      route: order.route,
      frequency: order.frequency,
      source: 'order', // Mark as coming from drug orders
    }));

    const manualEntriesData = localDrugsIVFluidsData.map((data, index) => ({
      id: `manual-${index}`,
      date: new Date().toLocaleDateString(),
      drugName: data.drugName,
      dosage: data.dosage,
      route: data.route || '',
      frequency: data.frequency || '',
      source: 'manual', // Mark as manual entry
    }));

    const combinedData = [...drugOrdersData, ...manualEntriesData];

    return combinedData;
  };

  // Generate table data for pulse and BP from backend
  const getPulseBPTableData = () => {
    // Map encounters to a combined row by encounterDatetime
    const bpMap = (loadedBPData || []).reduce((acc, encounter) => {
      const systolicObs = encounter.obs.find((obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['systolic-bp']);
      const diastolicObs = encounter.obs.find((obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['diastolic-bp']);
      if (systolicObs && diastolicObs) {
        acc[encounter.encounterDatetime] = {
          systolicBP: typeof systolicObs.value === 'number' ? systolicObs.value : parseFloat(systolicObs.value),
          diastolicBP: typeof diastolicObs.value === 'number' ? diastolicObs.value : parseFloat(diastolicObs.value),
          date: new Date(encounter.encounterDatetime).toLocaleDateString(),
          time: new Date(encounter.encounterDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return acc;
    }, {} as Record<string, any>);

    // For each pulse, try to find matching BP by encounterDatetime
    return (loadedPulseData || []).map((encounter, index) => {
      const pulseObs = encounter.obs.find((obs) => obs.concept.uuid === PARTOGRAPHY_CONCEPTS['maternal-pulse']);
      const pulse = pulseObs
        ? typeof pulseObs.value === 'number'
          ? pulseObs.value
          : parseFloat(pulseObs.value)
        : null;
      const date = new Date(encounter.encounterDatetime).toLocaleDateString();
      const time = new Date(encounter.encounterDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const bp = bpMap[encounter.encounterDatetime] || {};
      return {
        id: `pulse-bp-${index}`,
        pulse,
        systolicBP: bp.systolicBP ?? '',
        diastolicBP: bp.diastolicBP ?? '',
        date,
        time,
      };
    });
  };

  // Generate table data for temperature from backend only
  const getTemperatureTableData = () => {
    return loadedTemperatureData.map((encounter, index) => {
      const tempObs = encounter.obs.find((obs) => obs.concept.uuid === '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      const timeObs = encounter.obs.find(
        (obs) =>
          obs.concept.uuid === '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' &&
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
      let temperature = tempObs?.value ?? null;
      if (typeof temperature === 'string') {
        const parsed = parseFloat(temperature);
        temperature = isNaN(parsed) ? null : parsed;
      }
      return {
        id: `temperature-${index}`,
        date: new Date(encounter.encounterDatetime).toLocaleDateString(),
        timeSlot: '',
        exactTime: time,
        temperature,
      };
    });
  };

  const getUrineTestTableData = () => urineTestData;

  const handleViewModeChange = (graphId: string, mode: 'graph' | 'table') => {
    setViewMode((prev) => ({
      ...prev,
      [graphId]: mode,
    }));
  };

  const handlePageChange = (graphId: string, page: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [graphId]: page,
    }));
  };

  const handlePageSizeChange = (graphId: string, size: number) => {
    setPageSize((prev) => ({
      ...prev,
      [graphId]: size,
    }));
    setCurrentPage((prev) => ({
      ...prev,
      [graphId]: 1,
    }));
  };

  const getTableData = (graph) => {
    // Special handling for cervix graph to use form data
    if (graph.id === 'cervix') {
      return loadedCervixData
        .filter((data) => {
          // Filter out any data with NaN values
          return (
            !isNaN(data.hour) &&
            !isNaN(data.cervicalDilation) &&
            !isNaN(data.descentOfHead) &&
            data.time &&
            data.time.trim() !== ''
          );
        })
        .map((data, index) => ({
          id: `cervix-${index}`,
          date: new Date(data.encounterDatetime).toLocaleDateString() || 'N/A',
          actualTime: new Date(data.encounterDatetime).toLocaleTimeString() || 'N/A',
          cervicalDilation: `${data.cervicalDilation} cm`,
          descentOfHead: `${data.descentOfHead}`,
          hourInput: `${data.hour} hr`,
          formTime: data.time || 'N/A',
        }));
    }

    // Membrane amniotic fluid: use backend data only
    if (graph.id === 'membrane-amniotic-fluid') {
      return membraneAmnioticFluidEntries.map((data, index) => ({
        id: data.id || `maf-${index}`,
        date: data.date,
        timeSlot: data.timeSlot || '',
        exactTime: data.time || '',
        amnioticFluid: data.amnioticFluid,
        moulding: data.moulding,
      }));
    }

    // Fallback for other graphs: use local state if available
    if (localPartographyData[graph.id] && localPartographyData[graph.id].length > 0) {
      return localPartographyData[graph.id].map((item, index) => ({
        id: `${graph.id}-${index}`,
        time: item.time || 'N/A',
        value: item.value || item.measurementValue || 'N/A',
        date: new Date(item.timestamp).toLocaleDateString() || 'N/A',
        ...item, // Include any additional fields
      }));
    }

    // Otherwise, return empty or dummy data
    return ENABLE_DUMMY_DATA ? generateDummyTableData(graph.id) : [];
  };

  // Function to generate dummy table data
  const generateDummyTableData = (graphId: string) => {
    const baseEntries = [
      { time: '08:00', date: new Date().toLocaleDateString() },
      { time: '09:00', date: new Date().toLocaleDateString() },
      { time: '10:00', date: new Date().toLocaleDateString() },
      { time: '11:00', date: new Date().toLocaleDateString() },
      { time: '12:00', date: new Date().toLocaleDateString() },
    ];

    switch (graphId) {
      case 'fetal-heart-rate':
        return baseEntries.map((entry, index) => ({
          id: `fhr-${index}`,
          date: entry.date,
          time: entry.time,
          value: `${140 + Math.floor(Math.random() * 20)} bpm`,
        }));

      case 'maternal-pulse':
        return baseEntries.map((entry, index) => ({
          id: `pulse-${index}`,
          date: entry.date,
          time: entry.time,
          value: `${75 + Math.floor(Math.random() * 15)} bpm`,
        }));

      case 'blood-pressure':
        return baseEntries.map((entry, index) => ({
          id: `bp-${index}`,
          date: entry.date,
          time: entry.time,
          systolic: `${115 + Math.floor(Math.random() * 10)} mmHg`,
          diastolic: `${75 + Math.floor(Math.random() * 5)} mmHg`,
        }));

      case 'temperature':
        return baseEntries.map((entry, index) => ({
          id: `temp-${index}`,
          date: entry.date,
          time: entry.time,
          value: `${(36.5 + Math.random() * 0.8).toFixed(1)} °C`,
        }));

      case 'uterine-contractions':
        return baseEntries.map((entry, index) => ({
          id: `contractions-${index}`,
          date: entry.date,
          time: entry.time,
          value: `${Math.floor(Math.random() * 4) + 2} per 10 min`,
          duration: `${Math.floor(Math.random() * 20) + 30} sec`,
        }));

      default:
        return [];
    }
  };

  const getTableHeaders = (graph) => {
    // Special headers for cervix graph
    if (graph.id === 'cervix') {
      return [
        { key: 'date', header: t('date', 'Date') },
        { key: 'actualTime', header: t('actualTime', 'Actual Time') },
        { key: 'cervicalDilation', header: t('cervicalDilation', 'Cervical Dilation') },
        { key: 'descentOfHead', header: t('descentOfHead', 'Descent of Head') },
        { key: 'hourInput', header: t('hourInput', 'Hour Input') },
        { key: 'formTime', header: t('formTime', 'Form Time') },
      ];
    }

    // Default headers for other graphs
    return getPartographyTableHeaders(t);
  };

  const getValueStatus = (value: number, graph) => {
    if (!value || typeof value !== 'number') {
      return 'normal';
    }

    const normalRanges = {
      'fetal-heart-rate': { min: 110, max: 160 },
      'maternal-pulse': { min: 60, max: 100 },
      temperature: { min: 36, max: 37.5 },
      'blood-pressure': { min: 90, max: 140 },
    };

    const range = normalRanges[graph.id];
    if (!range) {
      return 'normal';
    }

    if (value < range.min) {
      return 'low';
    }
    if (value > range.max) {
      return 'high';
    }
    return 'normal';
  };

  const renderGraph = (graph: GraphDefinition, index: number, totalGraphs: number) => {
    const patientChartData: ChartDataPoint[] = graphData[graph.id] || [];
    const currentViewMode = viewMode[graph.id] || 'graph';
    const tableData = getTableData(graph);
    const currentPageNum = currentPage[graph.id] || 1;
    const currentPageSize = pageSize[graph.id] || 5;
    const isGraphLoading = isLoading[graph.id] || false;

    const totalItems = tableData.length;
    const startIndex = (currentPageNum - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    const paginatedData = tableData.slice(startIndex, endIndex);

    // Default chart data - declare once here
    let finalChartData: ChartDataPoint[] = patientChartData;
    let zeroTime: Date | undefined;
    let maxChartTime: Date | undefined;

    // --- Data for custom time labels ---
    let timeLabelsData: { hours: string; time: string; span: number }[] = [];

    // Default chart options with medical partograph styling
    let chartOptions: any = {
      title: graph.title,
      axes: {
        bottom: {
          title: t('time', 'Time'),
          mapsTo: 'time',
          scaleType: ScaleTypes.LABELS,
          grid: {
            enabled: true,
            strokeWidth: 1,
            strokeDasharray: '1,1',
          },
        },
        left: {
          title: graph.yAxisLabel,
          mapsTo: 'value',
          scaleType: ScaleTypes.LINEAR,
          domain: [graph.yMin, graph.yMax],
          grid: {
            enabled: true,
            strokeWidth: 1,
            strokeDasharray: '1,1',
          },
        },
      },
      curve: 'curveLinear',
      height: '500px',
      color: {
        scale: {
          [patientChartData[0]?.group || graph.id]: getColorForGraph(graph.color),
          Systolic: '#ff6b6b',
          Diastolic: '#4ecdc4',
        },
      },
      points: {
        enabled: true,
        radius: 5,
        strokeWidth: 2,
        fill: true,
      },
      grid: {
        x: {
          enabled: true,
          strokeWidth: 1,
          strokeDasharray: '1,1',
        },
        y: {
          enabled: true,
          strokeWidth: 1,
          strokeDasharray: '1,1',
        },
      },
      legend: {
        position: 'bottom',
        clickable: false,
      },
      theme: 'white',
      toolbar: {
        enabled: false,
      },
    };

    // Hide X-axis title and labels for non-cervix graphs only
    if (graph.id !== 'cervix') {
      chartOptions.axes.bottom.title = undefined;
      chartOptions.axes.bottom.tick = {
        formatter: () => '', // Hide tick labels for non-cervix graphs
      };
    }

    // --- START LOGIC FOR CERVIX GRAPH ---
    if (graph.id === 'cervix') {
      // 1. Apply custom axis and styling options
      chartOptions = {
        ...chartOptions,
        ...CERVIX_CHART_OPTIONS,
        title: graph.title,
        color: {
          scale: {
            'Alert Line': '#FFD700', // Yellow for alert line
            'Action Line': '#FF0000', // Red for action line
            'Cervical Dilation': '#22C55E', // Green for cervical dilation
            'Descent of Head': '#2563EB', // Blue for descent of head
            [graph.id]: getColorForGraph(graph.color),
          },
        },
        legend: {
          position: 'top', // Move legend to the top for Cervix graph
        },
      };

      // 2. Calculate Alert and Action Lines Data Points (using hour scale)
      const ALERT_START_CM = 4; // Changed from 5cm to 4cm as requested
      const CERVIX_DILATION_MAX = 10;
      const ALERT_ACTION_DIFFERENCE_HOURS = 4; // 4 hours difference
      const EXPECTED_LABOR_DURATION_HOURS = 6; // 6 hours progression from 4cm to 10cm

      const staticLinesData: ChartDataPoint[] = [
        // Alert Line Points: (Hour 0, 4cm) -> (Hour 6, 10cm)
        { hour: 0, value: ALERT_START_CM, group: 'Alert Line' },
        { hour: EXPECTED_LABOR_DURATION_HOURS, value: CERVIX_DILATION_MAX, group: 'Alert Line' },

        // Action Line Points: (Hour 4, 4cm) -> (Hour 10, 10cm)
        { hour: ALERT_ACTION_DIFFERENCE_HOURS, value: ALERT_START_CM, group: 'Action Line' },
        {
          hour: ALERT_ACTION_DIFFERENCE_HOURS + EXPECTED_LABOR_DURATION_HOURS,
          value: CERVIX_DILATION_MAX,
          group: 'Action Line',
        },
      ];

      // 3. Add Cervical Dilation data points from form inputs
      const cervicalDilationData: ChartDataPoint[] = cervixFormData.map((data) => ({
        hour: data.hour,
        value: data.cervicalDilation,
        group: 'Cervical Dilation',
        time: data.time,
      }));

      // 4. Add Descent of Head data points from form inputs
      // Medical reality: 5=high position → 4 → 3 → 2 → 1=most descended (head coming down)
      // Chart display: Show medical values directly (5 at top, 1 at bottom)
      const descentOfHeadData: ChartDataPoint[] = cervixFormData.map((data) => ({
        hour: data.hour,
        value: data.descentOfHead, // Direct mapping: medical 5→chart 5 (high), medical 1→chart 1 (low)
        group: 'Descent of Head',
        time: data.time,
      }));

      // 5. Combine all data - Alert/Action lines + patient data + form data
      finalChartData = [...patientChartData, ...staticLinesData, ...cervicalDilationData, ...descentOfHeadData];

      // 6. Generate dynamic time labels for the custom footer (from form data)
      timeLabelsData = [];

      // Create time labels based on form submissions or default to 10 columns if no data
      const maxHours = Math.max(10, Math.max(...cervixFormData.map((d) => d.hour), 0) + 1);

      for (let i = 0; i < Math.min(maxHours, 10); i++) {
        const hourLabel = i === 0 ? '0' : `${i}hr`;

        // Find corresponding form data for this hour
        const formDataForHour = cervixFormData.find((data) => data.hour === i);
        const timeValue = formDataForHour ? formDataForHour.time : '--:--';

        timeLabelsData.push({
          hours: hourLabel,
          time: timeValue,
          span: 1,
        });
      }
    }
    // --- END LOGIC FOR CERVIX GRAPH ---

    const shouldRenderChart = finalChartData.length > 0;

    return (
      <div className={styles.graphContainer} key={graph.id}>
        <div className={styles.graphHeader}>
          <div className={styles.graphHeaderLeft}>
            <h6>{graph.title}</h6>
            <Tag type="outline">{graph.normalRange}</Tag>
          </div>
          <div className={styles.graphHeaderRight}>
            <div className={styles.viewSwitcher}>
              <Button
                kind={currentViewMode === 'graph' ? 'primary' : 'secondary'}
                size={controlSize}
                hasIconOnly
                iconDescription={t('graphView', 'Graph View')}
                onClick={() => handleViewModeChange(graph.id, 'graph')}
                className={styles.viewButton}>
                <ChartColumn />
              </Button>
              <Button
                kind={currentViewMode === 'table' ? 'primary' : 'secondary'}
                size={controlSize}
                hasIconOnly
                iconDescription={t('tableView', 'Table View')}
                onClick={() => handleViewModeChange(graph.id, 'table')}
                className={styles.viewButton}>
                <TableIcon />
              </Button>
            </div>
            <Button kind="primary" size={controlSize} renderIcon={Add} onClick={() => handleAddDataPoint(graph.id)}>
              {t('add', 'Add')}
            </Button>
          </div>
        </div>
        <p className={styles.graphDescription}>{graph.description}</p>

        {currentViewMode === 'graph' ? (
          <>
            <div className={styles.chartContainer} data-chart-id={graph.id}>
              {isGraphLoading ? (
                <GraphSkeleton />
              ) : (
                <>
                  {shouldRenderChart ? (
                    <div className={graph.id === 'cervix' ? 'cervix-chart-wrapper' : ''}>
                      <LineChart data={finalChartData} options={chartOptions} />
                    </div>
                  ) : (
                    <LineChart
                      data={[{ group: graph.title, time: t('noData', 'No Data'), value: graph.yMin }]}
                      options={{
                        ...chartOptions,
                        axes: {
                          ...chartOptions.axes,
                          bottom: {
                            ...chartOptions.axes.bottom,
                            mapsTo: 'time',
                            title: undefined,
                            tick: {
                              formatter: () => '',
                            },
                          },
                        },
                        legend: {
                          enabled: false,
                        },
                        points: {
                          enabled: false,
                        },
                        color: {
                          scale: {
                            [graph.title]: '#d0d0d0',
                          },
                        },
                      }}
                    />
                  )}
                </>
              )}
            </div>
            {/* --- Custom Time Labels Display for Cervix Graph only --- */}
            {graph.id === 'cervix' && timeLabelsData.length > 0 && (
              <div
                className={styles.customTimeLabelsContainer}
                style={{ '--visible-columns': Math.min(10, timeLabelsData.length) } as React.CSSProperties}>
                {/* Hours Row */}
                <div className={styles.customTimeLabelsRow}>
                  <div className={styles.customTimeLabelHeader}>Hours</div>
                  {timeLabelsData.map((data, index) => (
                    <div
                      key={`hours-${index}`}
                      className={styles.customTimeLabelCell}
                      style={{
                        gridColumnEnd: `span ${data.span}`,
                        backgroundColor: '#f4f4f4',
                        fontWeight: 700,
                      }}>
                      {data.hours}
                    </div>
                  ))}
                </div>
                {/* Time Row */}
                <div className={styles.customTimeLabelsRow}>
                  <div className={styles.customTimeLabelHeader}>Time</div>
                  {timeLabelsData.map((data, index) => (
                    <div
                      key={`time-${index}`}
                      className={styles.customTimeLabelCell}
                      style={{ gridColumnEnd: `span ${data.span}` }}>
                      {data.time}
                    </div>
                  ))}
                </div>
                {/* Scroll indicator if content overflows */}
                {timeLabelsData.length > 10 && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      textAlign: 'center',
                      padding: '4px',
                      backgroundColor: '#f0f0f0',
                      borderTop: '1px solid #ddd',
                    }}>
                    ← Scroll horizontally to view all {timeLabelsData.length} hours →
                  </div>
                )}
              </div>
            )}
            {/* --- END Custom Time Labels --- */}

            {patientChartData.length > 0 && !isGraphLoading && (
              <div className={styles.chartStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>{t('latest', 'Latest')}:</span>
                  <span className={styles.statValue}>
                    {patientChartData[patientChartData.length - 1]?.value?.toFixed(1)} {graph.yAxisLabel}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>{t('average', 'Average')}:</span>
                  <span className={styles.statValue}>
                    {(patientChartData.reduce((sum, item) => sum + item.value, 0) / patientChartData.length).toFixed(1)}{' '}
                    {graph.yAxisLabel}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.tableContainer}>
            {isGraphLoading ? (
              <TableSkeleton />
            ) : paginatedData.length > 0 ? (
              <>
                <DataTable rows={paginatedData} headers={getTableHeaders(graph)}>
                  {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                    <TableContainer title="" description="">
                      <Table {...getTableProps()} size="sm">
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow {...getRowProps({ row })} key={row.id}>
                              {row.cells.map((cell) => {
                                let cellContent = cell.value;

                                // Only apply value status logic for non-cervix graphs
                                if (
                                  graph.id !== 'cervix' &&
                                  cell.info.header === 'value' &&
                                  row.cells.find((c) => c.info.header === 'value')
                                ) {
                                  const cellValue = cell.value;
                                  const status = getValueStatus(parseFloat(cellValue), graph);
                                  const statusClass =
                                    status === 'high' ? styles.highValue : status === 'low' ? styles.lowValue : '';
                                  cellContent = (
                                    <span className={statusClass}>
                                      {cellValue}
                                      {status === 'high' && <span className={styles.arrow}> ↑</span>}
                                      {status === 'low' && <span className={styles.arrow}> ↓</span>}
                                    </span>
                                  );
                                }

                                return <TableCell key={cell.id}>{cellContent}</TableCell>;
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </DataTable>

                {totalItems > 0 && (
                  <Pagination
                    page={currentPageNum}
                    totalItems={totalItems}
                    pageSize={currentPageSize}
                    pageSizes={[5, 10, 20, 50]}
                    onChange={(event) => {
                      handlePageChange(graph.id, event.page);
                      if (event.pageSize !== currentPageSize) {
                        handlePageSizeChange(graph.id, event.pageSize);
                      }
                    }}
                    size={controlSize}
                  />
                )}
                <div className={styles.tableStats}>
                  <span className={styles.recordCount}>
                    {t('showingResults', 'Showing {{start}}-{{end}} of {{total}} {{itemType}}', {
                      start: totalItems === 0 ? 0 : startIndex + 1,
                      end: Math.min(endIndex, totalItems),
                      total: totalItems,
                      itemType: totalItems === 1 ? t('record', 'record') : t('records', 'records'),
                    })}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>{t('noDataAvailable', 'No data available for this graph')}</p>
                <Button kind="primary" size={controlSize} renderIcon={Add} onClick={() => handleAddDataPoint(graph.id)}>
                  {t('addFirstDataPoint', 'Add first data point')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.partographyContainer}>
      <Layer>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            {/* Fetal Heart Rate Graph - Standalone */}
            <FetalHeartRateGraph
              data={computedFetalHeartRateData}
              tableData={getFetalHeartRateTableData()}
              viewMode={fetalHeartRateViewMode}
              currentPage={fetalHeartRateCurrentPage}
              pageSize={fetalHeartRatePageSize}
              totalItems={getFetalHeartRateTableData().length}
              controlSize={controlSize}
              onAddData={() => setIsFetalHeartRateFormOpen(true)}
              onViewModeChange={setFetalHeartRateViewMode}
              onPageChange={setFetalHeartRateCurrentPage}
              onPageSizeChange={setFetalHeartRatePageSize}
              isAddButtonDisabled={false}
            />

            {/* Membrane Amniotic Fluid Graph - Standalone */}
            <MembraneAmnioticFluidGraph
              data={membraneAmnioticFluidEntries}
              tableData={membraneAmnioticFluidEntries}
              viewMode={membraneAmnioticFluidViewMode}
              currentPage={membraneAmnioticFluidCurrentPage}
              pageSize={membraneAmnioticFluidPageSize}
              totalItems={membraneAmnioticFluidEntries.length}
              controlSize={controlSize}
              onAddData={() => setIsMembraneAmnioticFluidFormOpen(true)}
              onViewModeChange={setMembraneAmnioticFluidViewMode}
              onPageChange={setMembraneAmnioticFluidCurrentPage}
              onPageSizeChange={setMembraneAmnioticFluidPageSize}
              isAddButtonDisabled={false}
            />

            {/* Existing Partography Graphs - Contains Cervix Graph */}
            <div className={styles.partographyGrid}>
              {partographGraphs.map((graph, index) => renderGraph(graph, index, partographGraphs.length))}
            </div>

            {/* Cervical Contractions Graph - Positioned below Cervix graph */}
            <CervicalContractionsGraph
              data={transformEncounterToTableData(cervicalContractionsData || [], 'uterine-contractions').map(
                (row, index) => ({
                  id: row.id || `cc-${index}`,
                  date: row.dateTime?.split(' — ')[0] || '',
                  timeSlot: row.timeSlot || '',
                  contractionCount: row.contractionCount || '',
                  contractionLevel: row.contractionLevel || 'none',
                }),
              )}
              tableData={transformEncounterToTableData(cervicalContractionsData || [], 'uterine-contractions')}
              viewMode={cervicalContractionsViewMode}
              currentPage={cervicalContractionsCurrentPage}
              pageSize={cervicalContractionsPageSize}
              totalItems={transformEncounterToTableData(cervicalContractionsData || [], 'uterine-contractions').length}
              controlSize={controlSize}
              onAddData={() => setIsCervicalContractionsFormOpen(true)}
              onViewModeChange={setCervicalContractionsViewMode}
              onPageChange={setCervicalContractionsCurrentPage}
              onPageSizeChange={setCervicalContractionsPageSize}
              isAddButtonDisabled={false}
              patient={{
                uuid: patientUuid,
                name: 'Patient Name',
                gender: 'F',
                age: '28',
              }}
            />

            {/* Oxytocin Graph - Positioned below Cervical Contractions */}
            <OxytocinGraph
              data={loadedOxytocinData.map((item) => ({
                timeSlot: item.time ?? '',
                oxytocinUsed: typeof item.dropsPerMinute === 'number' && item.dropsPerMinute > 0 ? 'yes' : 'no',
                dropsPerMinute: typeof item.dropsPerMinute === 'number' ? item.dropsPerMinute : 0,
                date: item.encounterDatetime ? new Date(item.encounterDatetime).toLocaleDateString() : '',
                id: item.uuid || undefined,
              }))}
              tableData={loadedOxytocinData.map((item, index) => ({
                id: item.uuid || `oxy-${index}`,
                date: item.encounterDatetime ? new Date(item.encounterDatetime).toLocaleDateString() : '',
                timeSlot: item.time ?? '',
                oxytocinUsed: typeof item.dropsPerMinute === 'number' && item.dropsPerMinute > 0 ? 'yes' : 'no',
                dropsPerMinute: typeof item.dropsPerMinute === 'number' ? `${item.dropsPerMinute} drops/min` : 'N/A',
              }))}
              viewMode={oxytocinViewMode}
              currentPage={oxytocinCurrentPage}
              pageSize={oxytocinPageSize}
              totalItems={loadedOxytocinData.length}
              controlSize={controlSize}
              onAddData={() => setIsOxytocinFormOpen(true)}
              onViewModeChange={setOxytocinViewMode}
              onPageChange={setOxytocinCurrentPage}
              onPageSizeChange={setOxytocinPageSize}
              isAddButtonDisabled={false}
            />

            {/* Drugs and IV Fluids Graph - Positioned below Oxytocin */}
            <DrugsIVFluidsGraph
              data={getDrugsIVFluidsTableData()}
              tableData={getDrugsIVFluidsTableData()}
              viewMode={drugsIVFluidsViewMode}
              currentPage={drugsIVFluidsCurrentPage}
              pageSize={drugsIVFluidsPageSize}
              totalItems={getDrugsIVFluidsTableData().length}
              controlSize={controlSize}
              onAddData={() => {}} // Form handling is done by the wrapper component
              onViewModeChange={setDrugsIVFluidsViewMode}
              onPageChange={setDrugsIVFluidsCurrentPage}
              onPageSizeChange={setDrugsIVFluidsPageSize}
              isAddButtonDisabled={false}
              patient={{
                uuid: patientUuid,
                name: 'Patient Name',
                gender: 'F',
                age: '28',
              }}
              onDrugsIVFluidsSubmit={handleDrugsIVFluidsFormSubmit}
              onDataSaved={handleDrugOrderDataSaved}
            />

            {/* Pulse and BP Graph - Positioned below Drugs and IV Fluids */}
            <PulseBPGraph
              data={getPulseBPTableData()}
              tableData={getPulseBPTableData()}
              viewMode={pulseBPViewMode}
              currentPage={pulseBPCurrentPage}
              pageSize={pulseBPPageSize}
              totalItems={getPulseBPTableData().length}
              controlSize={controlSize}
              onAddData={() => {}}
              onViewModeChange={setPulseBPViewMode}
              onPageChange={setPulseBPCurrentPage}
              onPageSizeChange={setPulseBPPageSize}
              isAddButtonDisabled={false}
              patient={{
                uuid: patientUuid,
                name: 'Patient Name',
                gender: 'F',
                age: '28',
              }}
              onPulseBPSubmit={handlePulseBPFormSubmit}
            />

            {/* Temperature Graph - Positioned below Pulse and BP */}
            <TemperatureGraph
              data={getTemperatureTableData()}
              tableData={getTemperatureTableData()}
              viewMode={temperatureViewMode}
              currentPage={temperatureCurrentPage}
              pageSize={temperaturePageSize}
              totalItems={getTemperatureTableData().length}
              controlSize={controlSize}
              onAddData={() => {
                const now = new Date();
                const hh = String(now.getHours()).padStart(2, '0');
                const mm = String(now.getMinutes()).padStart(2, '0');
                setTemperatureFormInitialTime(`${hh}:${mm}`);
                setIsTemperatureFormOpen(true);
              }}
              onViewModeChange={setTemperatureViewMode}
              onPageChange={setTemperatureCurrentPage}
              onPageSizeChange={setTemperaturePageSize}
              isAddButtonDisabled={false}
            />

            {/* Urine Test Graph - Now using backend data */}
            <UrineTestGraph
              data={urineTestData}
              tableData={urineTestData}
              viewMode={urineTestViewMode}
              currentPage={urineTestCurrentPage}
              pageSize={urineTestPageSize}
              totalItems={urineTestData.length}
              controlSize={controlSize}
              onAddData={() => setIsUrineTestFormOpen(true)}
              onViewModeChange={setUrineTestViewMode}
              onPageChange={setUrineTestCurrentPage}
              onPageSizeChange={setUrineTestPageSize}
              isAddButtonDisabled={false}
            />

            {isFormOpen && (
              <PartographyDataForm
                isOpen={isFormOpen}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                graphType={selectedGraphType}
                graphTitle={partographGraphs.find((g) => g.id === selectedGraphType)?.title || ''}
              />
            )}
            {isCervixFormOpen && (
              <CervixForm
                isOpen={isCervixFormOpen}
                onClose={handleCervixFormClose}
                onSubmit={handleCervixFormSubmit}
                onDataSaved={handleCervixDataSaved}
                selectedHours={selectedHours}
                existingTimeEntries={computedExistingTimeEntries}
                existingCervixData={existingCervixData}
                patient={{
                  uuid: patientUuid,
                  name: 'Patient',
                  gender: 'Female',
                  age: '40 Years',
                }}
              />
            )}
            {isFetalHeartRateFormOpen && (
              <FetalHeartRateForm
                isOpen={isFetalHeartRateFormOpen}
                onClose={handleFetalHeartRateFormClose}
                onSubmit={handleFetalHeartRateFormSubmit}
                onDataSaved={handleFetalHeartRateDataSaved}
                existingTimeEntries={computedExistingTimeEntries}
                patient={{
                  uuid: patientUuid,
                  name: 'Patient',
                  gender: 'Female',
                  age: '40 Years',
                }}
              />
            )}
            {isMembraneAmnioticFluidFormOpen && (
              <MembraneAmnioticFluidForm
                isOpen={isMembraneAmnioticFluidFormOpen}
                onClose={handleMembraneAmnioticFluidFormClose}
                onSubmit={handleMembraneAmnioticFluidFormSubmit}
                patient={{
                  uuid: patientUuid,
                  name: 'Patient',
                  gender: 'Female',
                  age: '40 Years',
                }}
              />
            )}
            {isCervicalContractionsFormOpen && (
              <CervicalContractionsForm
                isOpen={isCervicalContractionsFormOpen}
                onClose={handleCervicalContractionsFormClose}
                onSubmit={handleCervicalContractionsFormSubmit}
                patient={{
                  uuid: patientUuid,
                  name: 'Patient',
                  gender: 'Female',
                  age: '40 Years',
                }}
              />
            )}
            {isOxytocinFormOpen && (
              <OxytocinForm
                isOpen={isOxytocinFormOpen}
                onClose={handleOxytocinFormClose}
                onSubmit={handleOxytocinFormSubmit}
                existingTimeEntries={existingTimeEntries}
                patient={{
                  uuid: patientUuid,
                  name: 'Patient',
                  gender: 'F',
                  age: '28',
                }}
              />
            )}
            {isTemperatureFormOpen && (
              <TemperatureForm
                isOpen={isTemperatureFormOpen}
                onClose={() => setIsTemperatureFormOpen(false)}
                onSubmit={handleTemperatureFormSubmit}
                initialTime={temperatureFormInitialTime}
                existingTimeEntries={existingTimeEntries}
                patient={{
                  uuid: patientUuid,
                  name: 'Patient',
                  gender: 'F',
                  age: '28',
                }}
              />
            )}
            {isUrineTestFormOpen && (
              <UrineTestForm
                isOpen={isUrineTestFormOpen}
                onClose={() => setIsUrineTestFormOpen(false)}
                onSubmit={handleUrineTestFormSubmit}
                existingTimeEntries={existingTimeEntries}
                patient={{
                  uuid: patientUuid,
                  name: 'Patient',
                  gender: 'F',
                  age: '28',
                }}
              />
            )}
          </Column>
        </Grid>
      </Layer>
    </div>
  );
};

export default Partograph;
