import React from 'react';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, Button, TabPanel, TabPanels, InlineLoading } from '@carbon/react';
import { isDesktop, launchWorkspace, useLayoutType, showSnackbar } from '@openmrs/esm-framework';
import { AirlineManageGates, UpdateNow } from '@carbon/react/icons';

import ReferralTable from '../referrals.component';
import { pullFacilityReferrals } from '../refferals.resource';
import styles from './referrals-tabs.scss';

const ReferralTabs: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'md' : 'sm';
  const [activeTabIndex, setActiveTabIndex] = React.useState<number>(0);

  const { trigger: pullReferrals, isMutating: isLoadingFacilityReferrals } = useSWRMutation(
    '/ws/rest/v1/kenyaemril/pullFacilityReferrals',
    async () => {
      return await pullFacilityReferrals();
    },
    {
      onSuccess: () => {
        mutate(
          (key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/kenyaemril/communityReferrals?status=active'),
        );
        showSnackbar({
          title: t('success', 'Success'),
          subtitle: t('referralsPulledSuccessfully', 'Referrals pulled successfully'),
          kind: 'success',
          isLowContrast: true,
        });
      },
      onError: (error) => {
        showSnackbar({
          title: t('errorPullingReferrals', 'Error pulling referrals'),
          subtitle: error?.message || t('unknownError', 'An unknown error occurred'),
          kind: 'error',
          isLowContrast: true,
        });
      },
    },
  );

  const handleReferral = () => {
    launchWorkspace('facility-referral-form', {
      workspaceTitle: 'Referral Form',
    });
  };

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div className={styles.referralsList} data-testid="referralsList-list">
      <div className={styles.tabsContainer}>
        <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange}>
          <TabList aria-label="Referrals tabs" contained>
            <Tab className={styles.tab}>{t('fromCommunity', 'From Community')}</Tab>
            <Tab className={styles.tab}>{t('fromFacility', 'From Facility')}</Tab>
            <Tab className={styles.tab}>{t('completed', 'Completed')}</Tab>
          </TabList>
        </Tabs>
        <div className={styles.actionBtn}>
          <Button
            kind="primary"
            renderIcon={UpdateNow}
            iconDescription={t('pullReferrals', 'Pull Referrals')}
            onClick={pullReferrals}
            className={styles.actionBtn}
            size={responsiveSize}
            disabled={isLoadingFacilityReferrals}>
            {isLoadingFacilityReferrals ? (
              <InlineLoading description="Pulling referrals..." status="active" />
            ) : (
              t('pullReferrals', 'Pull Referrals')
            )}
          </Button>
          <Button
            kind="tertiary"
            renderIcon={(props) => <AirlineManageGates size={20} {...props} />}
            onClick={handleReferral}
            iconDescription={t('referralPatient', 'Refer Patient')}
            size={responsiveSize}>
            {t('referralPatient', 'Refer Patient')}
          </Button>
        </div>
      </div>
      <TabPanels>
        <TabPanel>
          <ReferralTable status="active" />
        </TabPanel>
        <TabPanel>
          <ReferralTable status="active" />
        </TabPanel>
        <TabPanel>
          <ReferralTable status="completed" />
        </TabPanel>
      </TabPanels>
    </div>
  );
};

export default ReferralTabs;
