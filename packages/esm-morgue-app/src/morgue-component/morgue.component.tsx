import React from 'react';
import { MorgueHeader } from '../morgue-header/morgue-header.component';
import MorgueMetrics from '../morgue-metrics/morgue-metrics.component';
import { ContentSwitchTabs } from '../content-switcher/content-switcher.component';

const MorgueComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <MorgueHeader title={'Morgue'} />
      <MorgueMetrics />
      <ContentSwitchTabs />
    </div>
  );
};

export default MorgueComponent;
