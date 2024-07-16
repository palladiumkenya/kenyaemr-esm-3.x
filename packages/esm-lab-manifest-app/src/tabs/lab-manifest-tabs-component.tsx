import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './lab-manifest-tabs.scss';

export const LabManifestTabs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <main>
      <Tabs className={styles.tabs}>
        <TabList className={styles.tablist} aria-label="List tabs" contained>
          <Tab className={styles.tab}>{t('draft', 'Draft')}</Tab>
          <Tab className={styles.tab}>{t('readyToSend', 'Ready To Send')}</Tab>
          <Tab className={styles.tab}>{t('onHold', 'On Hold')}</Tab>
          <Tab className={styles.tab}>{t('sending', 'Sending')}</Tab>
          <Tab className={styles.tab}>{t('submitted', 'Submitted')}</Tab>
          <Tab className={styles.tab}>{t('icompleteWithErrors', 'Incomplete with Errors')}</Tab>
          <Tab className={styles.tab}>{t('incompleteWithResults', 'Incomplete With Results')}</Tab>
          <Tab className={styles.tab}>{t('completeWithErrors', 'Complete With Errors')}</Tab>
          <Tab className={styles.tab}>{t('completeWithResults', 'Complete with REsults')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel></TabPanel>
          <TabPanel></TabPanel>
          <TabPanel></TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
};
