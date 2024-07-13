import { Layer, Tab, TabList, TabPanel, TabPanels, Tabs, Tile } from '@carbon/react';
import { Analytics, CloudMonitoring, Dashboard } from '@carbon/react/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CarePanel from '../care-panel/care-panel.component';
import CarePrograms from '../care-programs/care-programs.component';

import CarePanelMachineLearning from '../machine-learning/machine-learning.component';
import styles from './care-panel-dashboard.scss';

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
            <Tab renderIcon={Analytics}>{t('machineLearning', 'Machine Learning')}</Tab>
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
              <CarePanelMachineLearning patientUuid={patientUuid} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Layer>
  );
};

export default CarePanelDashboard;
