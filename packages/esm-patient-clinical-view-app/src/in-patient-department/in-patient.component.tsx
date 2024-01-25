import React from 'react';
import { useTranslation } from 'react-i18next';
import ClinicalEncounter from '../clinical-encounter/clinical-enc.component';
import SurgicalSummery from '../clinical-encounter/summary/surgical summery/surgical-summery.component';
import NeonatalSummery from '../clinical-encounter/summary/neonatal summary/neonatal-summery.component';
import { Dashboard, CloudMonitoring, Activity, UserMultiple, UserFollow } from '@carbon/react/icons';
import { Tile, Layer, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import styles from './in-patient.scss';
import MaternalSummary from '../clinical-encounter/summary/maternal-summary/maternal-summary.component';
import InPatientSummary from '../clinical-encounter/summary/in-patient-medical-summary/in-patient-medical-summary.component';
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
            <h4>{t('inPatient', 'In Patient Views')}</h4>
          </div>
        </Tile>
      </Layer>
      <Layer style={{ backgroundColor: 'white', padding: '0 1rem' }}>
        <Tabs>
          <TabList contained activation="manual" aria-label="List of tabs">
            <Tab renderIcon={Dashboard}>{t('inPatientSummary', 'In Patient Summary')}</Tab>
            <Tab renderIcon={CloudMonitoring}>{t('encounterDetails', 'Encounter details')}</Tab>
            <Tab renderIcon={Activity}>{t('surgicalSummary', 'Surgical Summary')}</Tab>
            <Tab renderIcon={UserMultiple}>{t('neonatalSummary', 'Neonatal Summary')}</Tab>
            <Tab renderIcon={UserFollow}>{t('maternalSummary', 'Maternal Summary')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <InPatientSummary patientUuid={patientUuid} />
            </TabPanel>
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
          </TabPanels>
        </Tabs>
      </Layer>
    </>
  );
};
export default InPatientView;
