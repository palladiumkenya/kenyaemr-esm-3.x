import React from 'react';
import { Tabs, Tab, TabList, TabPanel, TabPanels, Button, ButtonSkeleton, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './tabs.scss';
import { WaitingQueue } from '../tables/waiting-queue.component';
import { AdmittedQueue } from '../tables/admitted-queue.component';
import { useDeceasedPatient } from '../hook/useMorgue.resource';
import { launchWorkspace, useConfig, useSession } from '@openmrs/esm-framework';
import { SettingsEdit } from '@carbon/react/icons';
import { ConfigObject } from '../config-schema';
import { DischargedBodies } from '../tables/discharge-queue.component';

export const MorgueTabs: React.FC = () => {
  const { t } = useTranslation();
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient();

  const tabPanels = [
    {
      name: t('waitQueue', 'Waiting queue'),
      component: <WaitingQueue isLoading={isLoading} deceasedPatients={deceasedPatients} error={error} />,
    },
    { name: t('admitted', 'Admitted'), component: <AdmittedQueue /> },
    {
      name: t('discharged', 'Discharged'),
      component: <DischargedBodies isLoading={isLoading} deceasedPatients={deceasedPatients} error={error} />,
    },
  ];

  return (
    <>
      <div className={styles.referralsList} data-testid="referralsList-list">
        <Tabs selected={0} role="navigation">
          <div className={styles.tabsContainer}>
            <TabList aria-label="Content Switcher as Tabs" contained>
              {tabPanels.map((tab, index) => (
                <Tab key={index}>{tab.name}</Tab>
              ))}
            </TabList>
          </div>

          <TabPanels>
            {tabPanels.map((tab, index) => (
              <TabPanel key={index}>
                <Layer>{tab.component}</Layer>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </>
  );
};
