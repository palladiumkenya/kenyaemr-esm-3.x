import React, { useState } from 'react';
import { Tabs, Tab, TabList, TabPanel, TabPanels, Button, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './tabs.scss';
import { WaitingQueue } from '../tables/waiting-queue.component';
import { AdmittedQueue } from '../tables/admitted-queue.component';
import { launchWorkspace } from '@openmrs/esm-framework';
import { Touch_1Filled } from '@carbon/react/icons';

export const MorgueTabs: React.FC = () => {
  const { t } = useTranslation();

  const tabPanels = [
    { name: t('waitQueue', 'Waiting queue'), component: <WaitingQueue /> },
    { name: t('admitted', 'Admitted'), component: <AdmittedQueue /> },
    { name: t('discharged', 'Discharged'), component: '' },
  ];

  const handleNewDeceased = () => {
    launchWorkspace('morgue-enroll-form', {
      workspaceTitle: 'Deceased Registration',
    });
  };

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
            <div className={styles.actionBtn}>
              <Button
                className={styles.rightButton}
                kind="secondary"
                renderIcon={Touch_1Filled}
                onClick={handleNewDeceased}>
                {t('enrollingBtn', 'Add New Deceased')}
              </Button>
            </div>
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
