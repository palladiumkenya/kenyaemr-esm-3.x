import { Button, Layer, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { SearchAdvanced } from '@carbon/react/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDeceasedPatient } from '../hook/useMorgue.resource';
import { AdmittedQueue } from '../tables/admitted-queue.component';
import { DischargedBodies } from '../tables/discharge-queue.component';
import styles from './tabs.scss';
import { launchWorkspace, useDebounce, WorkspaceContainer } from '@openmrs/esm-framework';

export const MorgueTabs: React.FC = () => {
  const { t } = useTranslation();
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient();

  // const awaitingCount = deceasedPatients?.filter((p) => p.status === 'awaiting').length || 0;
  const admittedCount = deceasedPatients?.filter((p) => p.status === 'admitted').length || 0;
  const dischargedCount = deceasedPatients?.filter((p) => p.status === 'discharged').length || 0;

  const getTabLabel = (baseLabel: string, count: number | null) => (
    <span className={styles.tabLabel}>
      {baseLabel} {isLoading ? '' : `(${count})`}
    </span>
  );

  const tabPanels = [
    // {
    //   name: getTabLabel(t('waitQueue', 'Waiting queue'), awaitingCount),
    //   component: <WaitingQueue isLoading={isLoading} deceasedPatients={deceasedPatients} error={error} />,
    // },
    {
      name: getTabLabel(t('admitted', 'Admitted'), admittedCount),
      component: <AdmittedQueue />,
    },
    {
      name: getTabLabel(t('discharged', 'Discharged'), dischargedCount),
      component: <DischargedBodies isLoading={isLoading} deceasedPatients={deceasedPatients} error={error} />,
    },
  ];
  const handleAdmitBodyWorkspace = () => {
    // launchWorkspace('admit-body-form');
  };
  return (
    <div className={styles.referralsList} data-testid="">
      <Tabs selected={0} role="navigation">
        <div className={styles.tabsContainer}>
          <TabList aria-label="Content Switcher as Tabs" contained>
            {tabPanels.map((tab, index) => (
              <Tab key={index}>{tab.name}</Tab>
            ))}
          </TabList>
          <div className={styles.actionBtn}>
            <Button
              kind="primary"
              renderIcon={(props) => <SearchAdvanced size={40} {...props} />}
              onClick={() => handleAdmitBodyWorkspace()}
              className={styles.actionBtn}
              disabled={isLoading}>
              {t('admitBodies', 'Admit bodies')}
            </Button>
          </div>
        </div>

        <TabPanels>
          {tabPanels.map((tab, index) => (
            <TabPanel key={index}>
              <Layer>{tab.component}</Layer>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};
