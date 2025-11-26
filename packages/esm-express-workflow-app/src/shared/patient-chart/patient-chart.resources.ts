import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AssignedExtension,
  FetchResponse,
  type Location,
  openmrsFetch,
  restBaseUrl,
  useAssignedExtensions,
  useConfig,
  useEmrConfiguration,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import { ExpressWorkflowConfig } from '../../config-schema';
import useSWR from 'swr';

export const usePatientChartTabs = (navigationPath: string, patientUuid: string, patient?: fhir.Patient) => {
  const { t } = useTranslation();
  const { patientChartConfig } = useConfig<ExpressWorkflowConfig>();
  const extensions = useAssignedExtensions('patient-chart-dashboard-slot');
  const tabs = useMemo<Array<AssignedExtension>>(() => {
    const customeExtenstions: Array<AssignedExtension> = [
      {
        id: 'charts-partography-dashboard',
        name: 'charts-partography-dashboard',
        moduleName: '@openmrs/esm-express-workflow-app',
        config: {},
        meta: {
          slot: 'maternal-and-child-health-partograph-slot',
          path: t('partograph', 'Partograph'),
        },
        online: true,
        offline: true,
      },
      {
        id: 'charts-mch-program-management-dashboard',
        name: 'charts-mch-program-management-dashboard',
        moduleName: '@openmrs/esm-express-workflow-app',
        config: {},
        meta: {
          slot: 'mch-program-management-slot',
          path: t('programManagement', 'ProgramManagement'),
        },
        online: true,
        offline: true,
      },
    ];
    extensions.push(...customeExtenstions);
    return extensions;
  }, [t, extensions]);

  const tabsExtensions = useMemo(() => {
    const isMchChart = navigationPath === 'mch';
    if (!patient) {
      return [];
    }
    return tabs.filter((tab) => {
      const shouldShowExtensionForFemalePatientsOnly = patientChartConfig.femaleOnlyExtensions.includes(tab.id);
      const shouldExcludeExtensionInMainChartAndIncludeInMchChart = patientChartConfig.excludeFromMainChart.includes(
        tab.id,
      );
      const shouldShowExtensionOnMchChart = patientChartConfig.includeInMchChart.includes(tab.id);
      const isCurrentPatientFemale = patient.gender.toLowerCase() === 'female';
      if (patientChartConfig.excludeExtensions.includes(tab.id)) {
        return false;
      }
      // Exclude if in mchOnlyExtensions and not on MCH chart
      if (shouldExcludeExtensionInMainChartAndIncludeInMchChart && !isMchChart) {
        return false;
      }
      // Exclude if not in mchExtensions and on MCH chart
      if (isMchChart && !shouldShowExtensionOnMchChart && !shouldExcludeExtensionInMainChartAndIncludeInMchChart) {
        return false;
      }
      // if femaleOnlyExtensions and patient is not female, exclude
      if (shouldShowExtensionForFemalePatientsOnly && !isCurrentPatientFemale) {
        return false;
      }
      return true;
    });
  }, [tabs, patientChartConfig, patient, navigationPath]);
  return tabsExtensions;
};

/**
 * fetches the latest admission encounter for the current patient, could be an admission encounter or a transfer encounter
 * Since the patient can be transferred to multiple locations, we need to fetch the latest admission encounter for the current patient
 * The visit encounters are sorted by encounter datetime in descending order, so the latest admission encounter is the first one
 * @param patientUuid
 * @returns {
 *   admissionEncounter: the latest admission encounter
 *   isLoading: whether the admission encounter is loading
 *   error: the error fetching the admission encounter
 *   mutate: mutate the admission encounter
 *   currentVisit: the current visit
 *   dischargeEncounter: the discharge encounter
 *   isPatientAdmitted: whether the patient is admitted
 * }
 */
export const useCurrentPatientAdmissionEncounter = (patientUuid: string) => {
  const { currentVisit, error: visitError, isLoading: isLoadingVisit, mutate: mutateVisit } = useVisit(patientUuid);
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();
  const { inPatientVisitTypeUuid } = useConfig<{ inPatientVisitTypeUuid: string }>({
    externalModuleName: '@kenyaemr/esm-ward-app',
  });
  // Admission or Tranfer encounter depending on wether patient was transfered or admitted directly
  const latestAdmisionEncounter = useMemo(() => {
    return currentVisit?.encounters?.find(
      (encounter) =>
        encounter.encounterType.uuid === emrConfiguration?.admissionEncounterType?.uuid ||
        encounter.encounterType.uuid === emrConfiguration?.transferWithinHospitalEncounterType?.uuid,
    );
  }, [currentVisit, emrConfiguration]);

  const dischargeEncounter = useMemo(() => {
    return currentVisit?.encounters?.find(
      (encounter) => encounter.encounterType.uuid === emrConfiguration?.exitFromInpatientEncounterType?.uuid,
    );
  }, [currentVisit, emrConfiguration]);

  const isPatientAdmitted = useMemo(() => {
    return latestAdmisionEncounter && !dischargeEncounter;
  }, [latestAdmisionEncounter, dischargeEncounter]);

  return {
    admissionEncounter: latestAdmisionEncounter,
    isLoading: isLoadingVisit || isLoadingEmrConfiguration,
    error: visitError || errorFetchingEmrConfiguration,
    mutate: mutateVisit,
    currentVisit,
    dischargeEncounter,
    isPatientAdmitted: isPatientAdmitted && currentVisit?.visitType.uuid === inPatientVisitTypeUuid,
  };
};

/**
 * Show partography component when patient is a female patient, admitted to labour ward
 * @param patientUuid string
 */
export const useShowPatography = (patientUuid: string) => {
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);
  const isFemale = patient?.gender?.toLowerCase() === 'female';

  const {
    admissionEncounter,
    error: admissionError,
    isLoading: isloadingAdmission,
    isPatientAdmitted,
  } = useCurrentPatientAdmissionEncounter(patientUuid);
  const {
    error: tagsError,
    isLoading: isloadingTags,
    tags,
  } = useAdmissionLocationTags(admissionEncounter?.location?.uuid);
  const { inpatientLocationTags } = useConfig<ExpressWorkflowConfig>();
  const admissionLocationIsLabourWard = useMemo(
    () => Object.values(inpatientLocationTags).every((tag) => tags.some((t) => t.uuid === tag)),
    [inpatientLocationTags, tags],
  );

  return {
    isLoading: isLoadingPatient || isLoadingPatient || isloadingAdmission || isloadingTags,
    error: patientError ?? admissionError ?? tagsError,
    showPartography: isFemale && isPatientAdmitted && admissionLocationIsLabourWard,
  };
};

type Tag = { uuid: string; display: string; name: string; description: string };

const useAdmissionLocationTags = (locationUuid?: string) => {
  const rep = 'custom:(tags:(uuid,display,name,description))';
  const url = `${restBaseUrl}/location/${locationUuid}?v=${rep}`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<{ tags: Array<Tag> }>>(
    locationUuid ? url : null,
    openmrsFetch,
  );
  return {
    tags: data?.data?.tags ?? [],
    isLoading,
    error,
    mutate,
  };
};
