import React from 'react';
import { ClaimManagementHeader } from '../header/case-management-header';
import CaseMetric from '../metrics/case-management-metric.component';
import CaseManagementTabs from '../tabs/case-management-tabs.component';

const WrapComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ClaimManagementHeader title={'Home'} />
      <CaseMetric />
      <CaseManagementTabs />
    </div>
  );
};

export default WrapComponent;
