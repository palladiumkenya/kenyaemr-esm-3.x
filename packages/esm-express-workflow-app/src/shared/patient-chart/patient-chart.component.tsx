import React, { useEffect, useMemo } from 'react';
import {
  ErrorState,
  ExtensionSlot,
  fetchCurrentPatient,
  setCurrentVisit,
  WorkspaceContainer,
} from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import styles from './patient-chart.scss';
import { InlineLoading, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const PatientChart: React.FC = () => {
  const { t } = useTranslation();
  const { patientUuid } = useParams<{ patientUuid?: string }>();

  const {
    data: patient,
    isLoading,
    error,
  } = useSWR(patientUuid ? ['patient', patientUuid] : null, () => fetchCurrentPatient(patientUuid!, {}));

  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);

  useEffect(() => {
    if (patientUuid) {
      setCurrentVisit(patientUuid, null);
    }
    return () => {
      setCurrentVisit(null, null);
    };
  }, [patientUuid]);

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
            <Tab>{t('vitalsAndAnthropometric', 'Vitals and Anthropometric')}</Tab>
            <Tab>{t('programManagement', 'Program Management')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ExtensionSlot name="vitals-and-anthropometric-slot" state={state} />
            </TabPanel>
            <TabPanel>
              <ExtensionSlot name="program-management-slot" state={state} />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <WorkspaceContainer
          showSiderailAndBottomNav
          key="express-workflow"
          contextKey={`express-workflow/triage/${patientUuid}`}
          additionalWorkspaceProps={state}
        />
      </div>
    </div>
  );
};

export default PatientChart;
