import React, { useMemo } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Layer, Grid, Column } from '@carbon/react';
import {
  CloudMonitoring,
  Activity,
  IbmWatsonDiscovery,
  Settings,
  Dashboard,
  Calendar,
  Attachment,
} from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './patient-summary-dashboard.scss';

type PatientSummaryDashboardProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const PatientSummaryDashboard: React.FC<PatientSummaryDashboardProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();

  const state = useMemo(() => ({ patientUuid, patient }), [patientUuid, patient]);
  return (
    <Layer>
      <Grid condensed>
        <Column lg={16} md={8} sm={4}>
          <Tabs>
            <TabList contained>
              <Tab renderIcon={Dashboard}>{t('patientSummary', 'Patient Summary')}</Tab>
              <Tab renderIcon={Activity}>{t('vitalsAndAnthropometric', 'Vitals & Anthropometric')}</Tab>
              <Tab renderIcon={CloudMonitoring}>{t('carePanel', 'Care Panel')}</Tab>
              <Tab renderIcon={IbmWatsonDiscovery}>{t('immunizations', 'Immunizations')}</Tab>
              <Tab renderIcon={Settings}>{t('relationships', 'Relationships')}</Tab>
              <Tab renderIcon={Calendar}>{t('appointments', 'Appointments')}</Tab>
              <Tab renderIcon={Attachment}>{t('attachments', 'Attachments')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ExtensionSlot className={styles.ewfExtensionSlot} name="ewf-patient-summary-slot" state={state} />
              </TabPanel>
              <TabPanel>
                <ExtensionSlot className={styles.ewfExtensionSlot} name="ewf-vitals-slot" state={state} />
              </TabPanel>
              <TabPanel>
                <ExtensionSlot className={styles.ewfExtensionSlot} name="ewf-care-panel-slot" state={state} />
              </TabPanel>
              <TabPanel>
                <ExtensionSlot className={styles.ewfExtensionSlot} name="ewf-immunizations-slot" state={state} />
              </TabPanel>
              <TabPanel>
                <ExtensionSlot className={styles.ewfExtensionSlot} name="ewf-relationships-slot" state={state} />
              </TabPanel>
              <TabPanel>
                <ExtensionSlot className={styles.ewfExtensionSlot} name="ewf-appointments-slot" state={state} />
              </TabPanel>
              <TabPanel>
                <ExtensionSlot className={styles.ewfExtensionSlot} name="ewf-attachments-slot" state={state} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Grid>
    </Layer>
  );
};

export default PatientSummaryDashboard;
