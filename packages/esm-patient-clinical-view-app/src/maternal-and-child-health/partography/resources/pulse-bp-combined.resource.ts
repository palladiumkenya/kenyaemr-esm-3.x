import {
  useMaternalPulseData,
  transformMaternalPulseEncounterToChartData,
  transformMaternalPulseEncounterToTableData,
} from './maternal-pulse.resource';
import {
  useBloodPressureData,
  transformBloodPressureEncounterToChartData,
  transformBloodPressureEncounterToTableData,
} from './blood-pressure.resource';
import { useTranslation } from 'react-i18next';

export function usePulseBpCombinedData(patientUuid: string) {
  const { t } = useTranslation();
  const pulse = useMaternalPulseData(patientUuid);
  const bp = useBloodPressureData(patientUuid);
  let localizedError = pulse.error || bp.error;
  if (pulse.error || bp.error) {
    localizedError = t('Failed to load pulse or blood pressure data');
  }
  return {
    pulse,
    bp,
    isLoading: pulse.isLoading || bp.isLoading,
    error: localizedError,
    mutate: async () => {
      await pulse.mutate();
      await bp.mutate();
    },
  };
}

export function transformPulseBpCombinedToChartData(
  pulseEncounters: any[],
  bpEncounters: any[],
  t: (key: string, defaultValue?: string, options?: any) => string,
): { pulse: any; bloodPressure: any } {
  return {
    pulse: transformMaternalPulseEncounterToChartData(pulseEncounters, t),
    bloodPressure: transformBloodPressureEncounterToChartData(bpEncounters, t),
  };
}

export function transformPulseBpCombinedToTableData(
  pulseEncounters: any[],
  bpEncounters: any[],
  t: (key: string, defaultValue?: string, options?: any) => string,
): { pulse: any; bloodPressure: any } {
  return {
    pulse: transformMaternalPulseEncounterToTableData(pulseEncounters, t),
    bloodPressure: transformBloodPressureEncounterToTableData(bpEncounters, t),
  };
}
