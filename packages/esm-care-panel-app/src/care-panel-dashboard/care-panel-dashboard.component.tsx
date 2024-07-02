import React from 'react';
import { Tabs, TabList, Tab, TabPanel, TabPanels, Layer, Tile } from '@carbon/react';
import { Dashboard, CloudMonitoring, Printer, Analytics } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import CarePanel from '../care-panel/care-panel.component';
import CarePrograms from '../care-programs/care-programs.component';
import PatientSummary from '../patient-summary/patient-summary.component';

import styles from './care-panel-dashboard.scss';
import CarePanellIITRiskScore from '../iit-risk-score/iit-risk-score.component';

type CarePanelDashboardProps = { patientUuid: string; formEntrySub: any; launchPatientWorkspace: Function };

const CarePanelDashboard: React.FC<CarePanelDashboardProps> = ({
  formEntrySub,
  patientUuid,
  launchPatientWorkspace,
}) => {
  const { t } = useTranslation();
  return (
    <Layer className={styles.container}>
      <Tile>
        <div className={styles.desktopHeading}>
          <h4>{t('careProgramsEnrollement', 'Care panel')}</h4>
        </div>
      </Tile>
      <div className={styles.tabs}>
        <Tabs>
          <TabList contained activation="manual" aria-label="List of care panels">
            <Tab renderIcon={Dashboard}>{t('panelSummary', 'Panel summary')}</Tab>
            <Tab renderIcon={CloudMonitoring}>{t('enrollments', 'Program enrollment')}</Tab>
            <Tab renderIcon={Analytics}>{t('riskScore', 'IIT Risk Score')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <CarePanel
                patientUuid={patientUuid}
                formEntrySub={formEntrySub}
                launchPatientWorkspace={launchPatientWorkspace}
              />
            </TabPanel>
            <TabPanel>
              <CarePrograms patientUuid={patientUuid} />
            </TabPanel>
            <TabPanel>
              <CarePanellIITRiskScore patientUuid={patientUuid} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Layer>
  );
};

export default CarePanelDashboard;
