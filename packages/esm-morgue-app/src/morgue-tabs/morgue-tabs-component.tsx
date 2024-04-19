import React from 'react';
import { TabPanels, TabPanel, TabList, Tabs, Tab } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Admissionqueue } from '../morgue-tables/morgue-admission.component';
import { Discharged } from '../morgue-tables/morgue-discharged.component';
import { AdmittedQueue } from '../morgue-tables/morgue-admitted.component';
import styles from './morgue-tabs.scss';

export const MorgueTabs: React.FC = () => {
  const { t } = useTranslation();
  return (
    <main>
      <Tabs className={styles.tabs}>
        <TabList className={styles.tablist} aria-label="List tabs" contained>
          <Tab className={styles.tab}>{t('admission', 'Admission Queue')}</Tab>
          <Tab className={styles.tab}>{t('admitted', 'Admitted Bodies')}</Tab>
          <Tab className={styles.tab}>{t('discharge', 'Discharge Bodies')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Admissionqueue />
          </TabPanel>
          <TabPanel>
            <AdmittedQueue />
          </TabPanel>
          <TabPanel>
            <Discharged />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
};
