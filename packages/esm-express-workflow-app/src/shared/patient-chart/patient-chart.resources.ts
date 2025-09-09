import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const usePatientchartTabs = (navigationPath: string) => {
  const { t } = useTranslation();
  const tabs = useMemo(
    () => [
      {
        title: t('vitalsAndAnthropometric', 'Vitals and Anthropometric'),
        slotName: 'vitals-and-anthropometric-slot',
        paths: '*',
      },
      {
        title: t('programManagement', 'Program Management'),
        slotName: 'program-management-slot',
        paths: '*',
      },
      {
        // TODO: show only for mch
        title: t('partograph', 'Partograph'),
        slotName: 'patient-chart-partograph-slot',
        paths: ['mch'],
      },
    ],
    [t],
  );

  const pathTabs = useMemo(
    () => tabs.filter((tab) => tab.paths === '*' || tab.paths.includes(navigationPath)),
    [tabs, navigationPath],
  );
  return pathTabs;
};
