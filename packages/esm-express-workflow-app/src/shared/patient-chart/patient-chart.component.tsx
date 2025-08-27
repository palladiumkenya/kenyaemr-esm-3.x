import React from 'react';
import { ErrorState, ExtensionSlot, fetchCurrentPatient } from '@openmrs/esm-framework';
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
            <Tab>{t('vitalsAndAnthropometrics', 'Vitals and Anthropometrics')}</Tab>
            <Tab>{t('programManagement', 'Program Management')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ExtensionSlot name="vitals-and-anthropometrics-slot" state={{ patient, patientUuid }} />
            </TabPanel>
            <TabPanel>
              <ExtensionSlot name="program-management-slot" state={{ patient, patientUuid }} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientChart;
