import React, { useMemo } from 'react';
import useSWR from 'swr';
import { ErrorState, ExtensionSlot, fetchCurrentPatient, WorkspaceContainer } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import { InlineLoading, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { useTranslation } from 'react-i18next';

import { useInitialize } from './useInitialize';
import styles from './patient-chart.scss';
import { usePatientchartTabs } from './patient-chart.resources';

type PatientChartProps = {
  navigationPath: string;
};

const PatientChart: React.FC<PatientChartProps> = ({ navigationPath }) => {
  const { t } = useTranslation();
  const { patientUuid } = useParams<{ patientUuid?: string }>();
  const patientChartTabsExtensionSlotConfig = usePatientchartTabs(navigationPath);
  const {
    data: patient,
    isLoading,
    error,
  } = useSWR(patientUuid ? ['patient', patientUuid] : null, () => fetchCurrentPatient(patientUuid!, {}));

  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);

  useInitialize(patientUuid, state);

  if (isLoading) {
    return <InlineLoading description={t('loadingPatient', 'Loading patient...')} />;
  }

  if (error) {
    return <ErrorState headerTitle={t('errorLoadingPatient', 'Error loading patient')} error={error} />;
  }


  return (
    <div className={styles.patientChart}>
      {patient && patientUuid && <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />}
      <div className={styles.tabsContainer}>
        <Tabs>
          <TabList contained>
            {patientChartTabsExtensionSlotConfig.map((tabConfig, index) => (
              <Tab key={index}>{tabConfig.title}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {patientChartTabsExtensionSlotConfig.map((tabConfig, index) => (
              <TabPanel key={index}>
                <ExtensionSlot className={styles.extensionSlot} name={tabConfig.slotName} state={state} />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
        <WorkspaceContainer
          showSiderailAndBottomNav
          key="express-workflow"
          contextKey={`express-workflow/${navigationPath}/${patientUuid}`}
          additionalWorkspaceProps={state}
        />
      </div>
    </div>
  );
};

export default PatientChart;
