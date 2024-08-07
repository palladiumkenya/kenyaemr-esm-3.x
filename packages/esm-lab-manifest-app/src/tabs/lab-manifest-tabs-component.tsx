import { StructuredListSkeleton, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLabManifest } from '../hooks';
import { activeOrdersSupportManifestStatus } from '../lab-manifest.resources';
import LabManifestActiveRequests from '../tables/lab-manifest-active-requests.component';
import LabManifestSamples from '../tables/lab-manifest-samples.component';
import styles from './lab-manifest-tabs.scss';

interface LabManifestTabsProps {
  manifestUuid: string;
}

export const LabManifestTabs: React.FC<LabManifestTabsProps> = ({ manifestUuid }) => {
  const { t } = useTranslation();
  const { manifest, isLoading, error } = useLabManifest(manifestUuid);

  if (isLoading) {
    return <StructuredListSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('labManifestSamples', 'Lab Manifest Sample')} />;
  }

  if (!activeOrdersSupportManifestStatus.includes(manifest.manifestStatus)) {
    return <LabManifestSamples manifestUuid={manifestUuid} />;
  }

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
