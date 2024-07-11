import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, Button, TabPanel, TabPanels, InlineLoading } from '@carbon/react';
import styles from './referrals-tabs.scss';
import ReferralTable from '../referrals.component';
import { AirlineManageGates, UpdateNow } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import { pullFacilityReferrals } from '../refferals.resource';
import { mutate } from 'swr';

interface ReferralTabsProps {
  isLoadingFacilityReferrals: boolean;
}

const ReferralTabs: React.FC<ReferralTabsProps> = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = React.useState<number>(0);
  const [isLoadingFacilityReferrals, setIsLoadingFacilityReferrals] = useState(false);

  const handleReferral = () => {
    launchWorkspace('facility-referral-form', {
      workspaceTitle: 'Referral Form',
    });
  };

  const pullReferrals = () => {
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

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div className={styles.referralsList} data-testid="referralsList-list">
      <div className={styles.tabsContainer}>
        <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange} className={styles.tabs}>
          <TabList aria-label="Referrals tabs" contained>
            <Tab className={styles.tab}>{t('fromCommunity', 'From Community')}</Tab>
            <Tab className={styles.tab}>{t('fromFacility', 'From Facility')}</Tab>
            <Tab className={styles.tab}>{t('completed', 'Completed')}</Tab>
          </TabList>
        </Tabs>
        <div className={styles.actionBtn}>
          <Button
            kind="primary"
            renderIcon={(props) => <UpdateNow size={20} {...props} />}
            iconDescription={t('pullReferrals', 'Pull Referrals')}
            onClick={pullReferrals}
            className={styles.actionBtn}
            disabled={isLoadingFacilityReferrals}>
            {t('pullReferrals', 'Pull Referrals')}
          </Button>
          <Button
            kind="tertiary"
            renderIcon={(props) => <AirlineManageGates size={20} {...props} />}
            onClick={handleReferral}
            iconDescription={t('referralPatient', 'Refer Patient')}>
            {t('referralPatient', 'Refer Patient')}
          </Button>
        </div>
      </div>
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
    </div>
  );
};

export default ReferralTabs;
