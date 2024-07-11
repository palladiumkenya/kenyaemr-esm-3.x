import React, { useState, useCallback } from 'react';
import { ClaimManagementHeader } from '../header/case-management-header';
import CaseManagementTabs from '../tabs/case-management-tabs.component';
import MetricsHeader from '../metrics/case-management-header.component';

const WrapComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ClaimManagementHeader title={'Home'} />
      <MetricsHeader />
      <CaseManagementTabs />
    </div>
  );
};

export default WrapComponent;
