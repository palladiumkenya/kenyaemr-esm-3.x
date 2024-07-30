import React, { useState } from 'react';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Admissionqueue } from '../morgue-tables/morgue-admission.component';
import styles from './content-switcher.scss';

export const ContentSwitchTabs: React.FC = () => {
  const { t } = useTranslation();

  const switchTabs = [
    { name: t('awaitBay', 'Awaiting Queue'), component: <Admissionqueue /> },
    { name: t('admitted', 'Admitted Bodies'), component: '' },
    { name: t('discharge', 'Discharge Bodies'), component: '' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <div className={styles.contentSwitcherWrapper}>
        <ContentSwitcher
          className={styles.contentSwitcher}
          size="sm"
          selectedIndex={activeIndex}
          onChange={(event) => setActiveIndex(event.index)}>
          {switchTabs.map((tab, index) => (
            <Switch key={index} name={tab.name} text={tab.name} />
          ))}
        </ContentSwitcher>
      </div>
      <div className={styles.tabContent}>{switchTabs[activeIndex].component}</div>
    </>
  );
};
