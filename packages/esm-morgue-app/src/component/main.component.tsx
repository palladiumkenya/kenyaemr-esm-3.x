import React from 'react';
import { MorgueHeader } from '../header/morgue-header.component';
import { MorgueTabs } from '../tabs/tabs.component';

const MainComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <MorgueHeader title={'Morgue'} />
      <MorgueTabs />
    </div>
  );
};

export default MainComponent;
