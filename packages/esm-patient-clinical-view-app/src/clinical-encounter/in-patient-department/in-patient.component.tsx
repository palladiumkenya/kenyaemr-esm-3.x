import React from 'react';
import { useTranslation } from 'react-i18next';
import ClinicalEncounter from '../clinical-enc.component';
import SurgicalSummery from '../summary/surgical summary/surgical-summary.component';
import NeonatalSummery from '../summary/neonatal summary/neonatal-summery.component';
import {
  Activity,
  CloudMonitoring,
  Dashboard,
  Friendship,
  ReminderMedical,
  UserFollow,
  UserMultiple,
} from '@carbon/react/icons';
import { Layer, Tab, TabList, TabPanel, TabPanels, Tabs, Tile } from '@carbon/react';
import styles from './in-patient.scss';
import MaternalSummary from '../summary/maternal-summary/maternal-summary.component';
import InPatientSummary from '../summary/in-patient-medical-summary/in-patient-medical-summary.component';
import OutPatientSocialHistory from '../summary/out-patient-summary/patient-social-history.component';
import OutPatientMedicalHistory from '../summary/out-patient-summary/patient-medical-history.component';

interface InpatientProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub: any;
  launchPatientWorkspace: Function;
}

const InPatientView: React.FC<InpatientProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  return (
    <>
      <Layer>
        <Tile>
          <div className={styles.desktopHeading}>
            <h4>{t('inPatient', 'In Patient')}</h4>
          </div>
        </Tile>
      </Layer>
      <Layer style={{ backgroundColor: 'white', padding: '0 1rem' }}>
        <Tabs>
          <TabList contained activation="manual" aria-label="List of tabs">
            <Tab renderIcon={Friendship}>{t('socialHistory', 'Social History')}</Tab>
            <Tab renderIcon={ReminderMedical}>{t('medicalHistory', 'Medical History')}</Tab>
            <Tab renderIcon={CloudMonitoring}>{t('encounterDetails', 'Encounter details')}</Tab>
            <Tab renderIcon={Activity}>{t('surgicalSummary', 'Surgical Summary')}</Tab>
            <Tab renderIcon={UserMultiple}>{t('neonatalSummary', 'Neonatal Summary')}</Tab>
            <Tab renderIcon={UserFollow}>{t('maternalSummary', 'Maternal Summary')}</Tab>
            <Tab renderIcon={Dashboard}>{t('inPatientSummary', 'In Patient Summary')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>{<OutPatientSocialHistory patientUuid={patientUuid} />}</TabPanel>
            <TabPanel>{<OutPatientMedicalHistory patientUuid={patientUuid} />}</TabPanel>
            <TabPanel>{<ClinicalEncounter patientUuid={patientUuid} />}</TabPanel>
            <TabPanel>
              <SurgicalSummery encounterTypeUuid={encounterTypeUuid} patientUuid={patientUuid} />
            </TabPanel>
            <TabPanel>
              <NeonatalSummery patientUuid={patientUuid} />
            </TabPanel>
            <TabPanel>
              <MaternalSummary patientUuid={patientUuid} />
            </TabPanel>
            <TabPanel>
              <InPatientSummary patientUuid={patientUuid} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Layer>
    </>
  );
};
export default InPatientView;
