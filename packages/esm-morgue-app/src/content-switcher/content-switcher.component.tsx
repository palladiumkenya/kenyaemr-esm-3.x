import React, { useState } from 'react';
import { ContentSwitcher, Switch, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './content-switcher.scss';
import { WaitingQueue } from '../tables/waiting-queue.component';
import { AdmittedQueue } from '../tables/admitted-queue.component';
import { launchWorkspace } from '@openmrs/esm-framework';

export const ContentSwitchTabs: React.FC = () => {
  const { t } = useTranslation();

  const switchTabs = [
    { name: t('waitQueue', 'Waiting queue'), component: <WaitingQueue /> },
    { name: t('admitted', 'Admitted'), component: <AdmittedQueue /> },
    { name: t('discharged', 'Discharged'), component: '' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const handleNewDeceased = () => {
    launchWorkspace('morgue-enroll-form', {
      workspaceTitle: 'Deceased Registration',
    });
  };

  return (
    <>
      <div className={styles.contentSwitcherWrapper}>
        <div className={styles.switcherContainer}>
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

        <Button className={styles.rightButton} kind="secondary" onClick={handleNewDeceased}>
          {t('enrollingBtn', 'Add New Deceased')}
        </Button>
      </div>

      <div className={styles.tabContent}>{switchTabs[activeIndex].component}</div>
    </>
  );
};
