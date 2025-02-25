import React from 'react';
import { useTranslation } from 'react-i18next';
import { MorgueHeader } from '../header/morgue-header.component';
import { MorgueTabs } from '../tabs/tabs.component';

const MainComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={`omrs-main-content`}>
      <MorgueHeader title={t('mortuary', 'Mortuary')} />
      <MorgueTabs />
    </div>
  );
};

export default MainComponent;
