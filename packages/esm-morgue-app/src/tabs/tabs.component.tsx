import React from 'react';
import { Tabs, Tab, TabList, TabPanel, TabPanels, InlineLoading, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './tabs.scss';
import { WaitingQueue } from '../tables/waiting-queue.component';
import { AdmittedQueue } from '../tables/admitted-queue.component';
import { useDeceasedPatient } from '../hook/useMorgue.resource';
import { DischargedBodies } from '../tables/discharge-queue.component';

export const MorgueTabs: React.FC = () => {
  const { t } = useTranslation();
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient();

  const awaitingCount = deceasedPatients?.filter((p) => p.status === 'awaiting').length || 0;
  const admittedCount = deceasedPatients?.filter((p) => p.status === 'admitted').length || 0;
  const dischargedCount = deceasedPatients?.filter((p) => p.status === 'discharged').length || 0;

  const getTabLabel = (baseLabel: string, count: number | null) => (
    <span className={styles.tabLabel}>
      {baseLabel} {isLoading ? '' : `(${count})`}
    </span>
  );

  const tabPanels = [
    {
      name: getTabLabel(t('waitQueue', 'Waiting queue'), awaitingCount),
      component: <WaitingQueue isLoading={isLoading} deceasedPatients={deceasedPatients} error={error} />,
    },
    {
      name: getTabLabel(t('admitted', 'Admitted'), admittedCount),
      component: <AdmittedQueue />,
    },
    {
      name: getTabLabel(t('discharged', 'Discharged'), dischargedCount),
      component: <DischargedBodies isLoading={isLoading} deceasedPatients={deceasedPatients} error={error} />,
    },
  ];

  return (
    <div className={styles.referralsList} data-testid="referralsList-list">
      <Tabs selected={0} role="navigation">
        <div className={styles.tabsContainer}>
          <TabList aria-label="Content Switcher as Tabs" contained>
            {tabPanels.map((tab, index) => (
              <Tab key={index}>{tab.name}</Tab>
            ))}
          </TabList>
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
