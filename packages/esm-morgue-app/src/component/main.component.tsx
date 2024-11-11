import React from 'react';
import { MorgueHeader } from '../header/morgue-header.component';
import { MorgueTabs } from '../tabs/tabs.component';
import { useTranslation } from 'react-i18next';

const MainComponent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={`omrs-main-content`}>
      <MorgueHeader title={t('mortuaryTitle', 'Mortuary')} />
      <MorgueTabs />
    </div>
  );
};

export default MainComponent;
