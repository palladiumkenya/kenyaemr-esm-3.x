import React from 'react';
import { MorgueHeader } from '../header/morgue-header.component';
import { ContentSwitchTabs } from '../content-switcher/content-switcher.component';

const MainComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <MorgueHeader title={'Morgue'} />
      <ContentSwitchTabs />
    </div>
  );
};

export default MainComponent;
