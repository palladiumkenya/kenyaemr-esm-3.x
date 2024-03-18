import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels, Button } from '@carbon/react';
import styles from './community-referrals-tabs.scss';
import CommunityReferrals from '../community-referrals.component';

const CommunityReferralTabs = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div className={styles.referralsList} data-testid="referralsList-list">
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange} className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Referrals tabs" contained>
          <Tab className={styles.tab}>{t('active', 'Active')}</Tab>
          <Tab className={styles.tab}>{t('completed', 'Completed')}</Tab>
        </TabList>
        <Button>Pull Community Referrals</Button>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <CommunityReferrals status="active" />
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <CommunityReferrals status="completed" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default CommunityReferralTabs;
