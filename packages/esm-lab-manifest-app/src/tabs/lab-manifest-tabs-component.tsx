import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import LabManifestActiveRequests from '../tables/lab-manifest-active-requests.component';
import LabManifestSamples from '../tables/lab-manifest-samples.component';
import styles from './lab-manifest-tabs.scss';

interface LabManifestTabsProps {
  manifestUuid: string;
}

export const LabManifestTabs: React.FC<LabManifestTabsProps> = ({ manifestUuid }) => {
  const { t } = useTranslation();

  return (
    <main>
      <Tabs className={styles.tabs}>
        <TabList className={styles.tablist} aria-label="List tabs" contained>
          <Tab className={styles.tab}>{t('manifestSamples', 'ManifestSamples')}</Tab>
          <Tab className={styles.tab}>{t('activeRequests', 'Active Requests')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <LabManifestSamples manifestUuid={manifestUuid} />
          </TabPanel>
          <TabPanel>
            <LabManifestActiveRequests manifestUuid={manifestUuid} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
};
