import React from 'react';
import { useTranslation } from 'react-i18next';
import { MorgueTabs } from '../tabs/tabs.component';
import Header from '../header/header.component';
import styles from './home.scss';
import Summary from '../summary/summary.component';
import CustomContentSwitcher from '../switcher/content-switcher.component';

const HomeViewComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <Header title={t('mortuary', 'Mortuary')} />
      <Summary />
      <CustomContentSwitcher />
      {/* <MorgueTabs /> */}
    </section>
  );
};

export default HomeViewComponent;
