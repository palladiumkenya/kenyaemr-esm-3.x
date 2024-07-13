import React from 'react';
import { TabPanels, TabPanel, TabList, Tabs, Tab } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { PharmacyPatients } from '../pharmacy-tables/pharmacy-patients.component';
import { PharmacyUsers } from '../pharmacy-tables/pharmacy-users.component';
import styles from './pharmacy-tabs.scss';

export const PharmacyTabs: React.FC = () => {
  const { t } = useTranslation();
  return (
    <main>
      <Tabs className={styles.tabs}>
        <TabList className={styles.tablist} aria-label="List tabs" contained>
          <Tab className={styles.tab}>{t('patients', 'Assigned Patients')}</Tab>
          <Tab className={styles.tab}>{t('users', 'Asigned Users')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <PharmacyPatients />
          </TabPanel>
          <TabPanel>
            <PharmacyUsers />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
};
