import React from 'react';
import { TabPanels, TabPanel, TabList, Tabs, Tab } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { AdmissionQueue } from '../providers-tables/providers-admission.component';

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
            <AdmissionQueue />
          </TabPanel>
          <TabPanel>
            <AdmissionQueue />
          </TabPanel>
          <TabPanel>
            <AdmissionQueue />
          </TabPanel>
          <TabPanel>
            <AdmissionQueue />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
};
