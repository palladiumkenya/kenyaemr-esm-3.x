import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels, Button, InlineLoading } from '@carbon/react';
import styles from './community-referrals-tabs.scss';
import CommunityReferrals from '../community-referrals.component';
import { pullFacilityReferrals } from '../community-refferals.resource';
import { mutate } from 'swr';

const CommunityReferralTabs = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [isLoadingFacilityReferrals, setIsLoadingFacilityReferrals] = useState(false);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  const pullCommunityReferrals = () => {
    setIsLoadingFacilityReferrals(true);
    pullFacilityReferrals()
      .then((r) => {
        mutate(
          (key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/kenyaemril/communityReferrals?status=active'),
        );
        setIsLoadingFacilityReferrals(false);
      })
      .catch((err) => {
        setIsLoadingFacilityReferrals(false);
      });
  };

  return (
    <div className={styles.referralsList} data-testid="referralsList-list">
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange} className={styles.tabs}>
        <div style={{ display: 'flex' }}>
          <TabList style={{ paddingLeft: '1rem' }} aria-label="Referrals tabs" contained>
            <Tab className={styles.tab}>{t('active', 'Active')}</Tab>
            <Tab className={styles.tab}>{t('completed', 'Completed')}</Tab>
          </TabList>
          <Button onClick={pullCommunityReferrals}>Pull Community Referrals</Button>
        </div>
        <div>{isLoadingFacilityReferrals && <InlineLoading />}</div>
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
