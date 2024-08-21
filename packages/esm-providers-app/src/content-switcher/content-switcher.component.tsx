import React, { useState } from 'react';
import { ContentSwitcher, Switch, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './content-switcher.scss';

export const ContentSwitchTabs: React.FC = () => {
  const { t } = useTranslation();

  const switchTabs = [
    { name: t('allProviders', 'All providers'), component: '' },
    { name: t('providersWithActiveLicense', 'Active license'), component: '' },
    { name: t('expiringLicense', 'Expiring licenses'), component: '' },
    { name: t('expiredLicense', 'Expired licenses'), component: '' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <div className={styles.contentSwitcherWrapper}>
        <div className={styles.switcherContainer}>
          <ContentSwitcher
            className={styles.contentSwitcher}
            size="lg"
            selectedIndex={activeIndex}
            onChange={(event) => setActiveIndex(event.index)}>
            {switchTabs.map((tab, index) => (
              <Switch key={index} name={tab.name} text={tab.name} />
            ))}
          </ContentSwitcher>
        </div>

        <Button className={styles.rightButton} kind="secondary">
          {t('createAnAccount', 'Create an account')}
        </Button>
      </div>

      <div className={styles.tabContent}>{switchTabs[activeIndex].component}</div>
    </>
  );
};
