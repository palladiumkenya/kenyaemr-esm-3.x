import React, { useState } from 'react';
import { WorkspaceContainer } from '@openmrs/esm-framework';

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
      <WorkspaceContainer key="case-management" contextKey="case-management" />
    </div>
  );
};

export default WrapComponent;
