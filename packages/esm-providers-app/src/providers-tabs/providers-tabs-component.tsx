import React from 'react';
import { TabPanels, TabPanel, TabList, Tabs, Tab } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Admissionqueue } from '../providers-tables/providers-admission.component';
import { Discharged } from '../providers-tables/providers-discharged.component';
import { AdmittedQueue } from '../providers-tables/providers-admitted.component';

import styles from './providers-tabs.scss';

export const ProvidersTabs: React.FC = () => {
  const { t } = useTranslation();
  return (
    <main>
      <Tabs className={styles.tabs}>
        <TabList className={styles.tablist} aria-label="List tabs" contained>
          <Tab className={styles.tab}>{t('allprovider', 'All Providers')}</Tab>
          <Tab className={styles.tab}>{t('allactiveprovider', 'Active Providers')}</Tab>
          <Tab className={styles.tab}>{t('alldueprovider', 'Providers with License Due for Renewal')}</Tab>
          <Tab className={styles.tab}>{t('allexpiredprovider', 'Providers with Expired License')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Admissionqueue />
          </TabPanel>
          <TabPanel>
            <Admissionqueue />
          </TabPanel>
          <TabPanel>
            <Admissionqueue />
          </TabPanel>
          <TabPanel>
            <Admissionqueue />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
};
