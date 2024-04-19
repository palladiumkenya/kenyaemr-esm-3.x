import React from 'react';
import { MorgueHeader } from '../morgue-header/morgue-header.component';
import MorgueMetrics from '../morgue-metrics/morgue-metrics.component';
import { MorgueTabs } from '../morgue-tabs/morgue-tabs-component';

const MorgueComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <MorgueHeader title={'Morgue'} />
      <MorgueMetrics />
      <MorgueTabs />
    </div>
  );
};

export default MorgueComponent;
