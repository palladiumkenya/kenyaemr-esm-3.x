import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const usePatientchartTabs = (navigationPath: string) => {
  const { t } = useTranslation();
  const tabs = useMemo<
    Array<{ title: string; slotName: string; paths: string | Array<string>; exclude: Array<string> }>
  >(
    () => [
      {
        title: t('patientSummary', 'Patient Summary'),
        slotName: 'patient-chart-summary-dashboard-slot',
        paths: '*',
        exclude: [],
      },
      {
        title: t('vitalsAndAnthropometric', 'Vitals and Anthropometric'),
        slotName: 'patient-chart-vitals-biometrics-dashboard-slot',
        paths: '*',
        exclude: ['mch'],
      },
      {
        title: t('programManagement', 'Program Management'),
        slotName: 'patient-chart-care-panel-dashboard-slot',
        paths: '*',
        exclude: ['mch'],
      },
      {
        title: t('orders', 'Orders'),
        slotName: 'patient-chart-orders-dashboard-slot',
        paths: '*',
        exclude: [],
      },
      {
        title: t('results', 'Results'),
        slotName: 'patient-chart-test-results-dashboard-slot',
        paths: '*',
        exclude: [],
      },
      {
        title: t('partograph', 'Partograph'),
        slotName: 'maternal-and-child-health-partograph-slot',
        paths: ['mch'],
        exclude: [],
      },
    ],
    [t],
  );

  const pathTabs = useMemo(
    () =>
      tabs.filter(
        (tab) => (tab.paths === '*' || tab.paths.includes(navigationPath)) && !tab.exclude.includes(navigationPath),
      ),
    [tabs, navigationPath],
  );
  return pathTabs;
};
