import React, { useState } from 'react';
import { ClaimManagementHeader } from '../header/case-management-header';
import CaseManagementTabs from '../tabs/case-management-tabs.component';
import MetricsHeader from '../metrics/case-management-header.component';

const WrapComponent: React.FC = () => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  return (
    <div className={`omrs-main-content`}>
      <ClaimManagementHeader title={'Home'} />
      <MetricsHeader activeTabIndex={activeTabIndex} />
      <CaseManagementTabs setActiveTabIndex={setActiveTabIndex} />
    </div>
  );
};

export default WrapComponent;
