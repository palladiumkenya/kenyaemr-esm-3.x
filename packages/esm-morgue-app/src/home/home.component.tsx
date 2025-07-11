import React from 'react';
import { useTranslation } from 'react-i18next';
import { MorgueTabs } from '../tabs/tabs.component';
import Header from '../header/header.component';
import styles from './home.scss';
import Summary from '../summary/summary.component';
import CustomContentSwitcher from '../switcher/content-switcher.component';
import { useAwaitingQueuePatients } from './home.resource';

const HomeViewComponent: React.FC = () => {
  const { t } = useTranslation();
  const { awaitingQueueDeceasedPatients, isLoadingAwaitingQueuePatients, errorFetchingAwaitingQueuePatients } =
    useAwaitingQueuePatients();

  return (
    <section className={styles.section}>
      <Header title={t('mortuary', 'Mortuary')} />
      <Summary
        awaitingQueueCount={awaitingQueueDeceasedPatients.length}
        admittedCount={0}
        dischargedCount={0}
        isLoading={isLoadingAwaitingQueuePatients}
      />
      <CustomContentSwitcher
        awaitingQueueDeceasedPatients={awaitingQueueDeceasedPatients}
        isLoading={isLoadingAwaitingQueuePatients}
      />
      {/* <MorgueTabs /> */}
    </section>
  );
};

export default HomeViewComponent;
