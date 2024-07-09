import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels, InlineLoading } from '@carbon/react';
import styles from './referrals-tabs.scss';
import ReferralTable from '../referrals.component';

interface ReferralTabsProps {
  isLoadingFacilityReferrals: boolean;
}

const ReferralTabs: React.FC<ReferralTabsProps> = ({ isLoadingFacilityReferrals }) => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = React.useState<number>(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div className={styles.referralsList} data-testid="referralsList-list">
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange} className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Referrals tabs" contained>
          <Tab className={styles.tab}>{t('fromCommunity', 'From Community')}</Tab>
          <Tab className={styles.tab}>{t('fromFacility', 'From Facility')}</Tab>
          <Tab className={styles.tab}>{t('completed', 'Completed')}</Tab>
        </TabList>
        <div>{isLoadingFacilityReferrals && <InlineLoading description="Pulling referrals..." />}</div>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <ReferralTable status="active" />
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <ReferralTable status="active" />
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <ReferralTable status="completed" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default ReferralTabs;
