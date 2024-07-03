import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import styles from './case-management-tabs.scss';

const CaseManagementTabs = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div data-id="case-management-list">
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange} className={styles.tabs}>
        <div style={{ display: 'flex' }}>
          <TabList style={{ paddingLeft: '1rem' }} aria-label="case-management-tabs" contained>
            <Tab className={styles.tab}>{t('activeCases', 'Active cases')}</Tab>
            <Tab className={styles.tab}>{t('discontinuationCases', 'Discontinuation cases')}</Tab>
          </TabList>
        </div>
        <TabPanels>
          <TabPanel className={styles.tabPanel}></TabPanel>
          <TabPanel className={styles.tabPanel}></TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default CaseManagementTabs;
