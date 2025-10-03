import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssignedExtension, useAssignedExtensions, useConfig } from '@openmrs/esm-framework';
import { ExpressWorkflowConfig } from '../../config-schema';

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
