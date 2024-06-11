import React from 'react';
import { RadiologyHeader } from './header/radiology-header.component';
import { RadiologyTabs } from './radiology-tabs/radiology-tabs.component';
import RadiologySummaryTiles from './summary-tiles/radiology-summary-tiles.component';

const Radiology: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <RadiologyHeader />
      <RadiologySummaryTiles />
      <RadiologyTabs />
    </div>
  );
};

export default Radiology;
