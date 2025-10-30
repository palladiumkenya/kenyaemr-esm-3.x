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
 * Show partography component when patient is a femail patient, admitted to labour ward
 * @param patientUuid string
 */
export const useShowPatography = (patientUuid: string) => {
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);
  const isFemale = patient?.gender?.toLowerCase() === 'female';
  const { inPatientVisitTypeUuid } = useConfig<{ inPatientVisitTypeUuid: string }>({
    externalModuleName: '@kenyaemr/esm-ward-app',
  });
  const { currentVisit, error: visitError, isLoading: isLoadingVisit } = useVisit(patientUuid);
  const { emrConfiguration, errorFetchingEmrConfiguration, isLoadingEmrConfiguration } = useEmrConfiguration();
  const { isAdmitted, admissionLocation } = useMemo<{ isAdmitted: boolean; admissionLocation?: Location }>(() => {
    const isInPatientVisit = currentVisit?.visitType?.uuid === inPatientVisitTypeUuid;
    const admissionEncounter = currentVisit?.encounters?.find(
      (en) => en.encounterType.uuid === emrConfiguration?.admissionEncounterType?.uuid,
    );
    const dischargeEncounter = currentVisit?.encounters?.find(
      (en) => en.encounterType.uuid === emrConfiguration?.exitFromInpatientEncounterType?.uuid,
    );

    return {
      isAdmitted: currentVisit && isInPatientVisit && admissionEncounter && !dischargeEncounter,
      admissionLocation: admissionEncounter?.location,
    };
  }, [
    currentVisit,
    emrConfiguration?.admissionEncounterType?.uuid,
    emrConfiguration?.exitFromInpatientEncounterType.uuid,
    inPatientVisitTypeUuid,
  ]);
  const { error: tagsError, isLoading: isloadingTags, tags } = useAdmissionLocationTags(admissionLocation?.uuid);
  const { inpatientLocationTags } = useConfig<ExpressWorkflowConfig>();
  const admissionLocationIsLabourWard = useMemo(
    () => Object.values(inpatientLocationTags).every((tag) => tags.some((t) => t.uuid === tag)),
    [inpatientLocationTags, tags],
  );

  return {
    isLoading: isLoadingPatient || isLoadingPatient || isLoadingEmrConfiguration || isloadingTags,
    error: patientError ?? visitError ?? errorFetchingEmrConfiguration ?? tagsError,
    showPartography: isFemale && isAdmitted && admissionLocationIsLabourWard,
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
