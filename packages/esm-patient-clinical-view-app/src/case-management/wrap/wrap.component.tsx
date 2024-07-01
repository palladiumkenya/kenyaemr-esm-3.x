import React from 'react';
import { ClaimManagementHeader } from '../header/case-management-header';
import CaseMetric from '../metrics/case-management-metric.component';

const WrapComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ClaimManagementHeader title={'Home'} />
      <CaseMetric />
    </div>
  );
};

export default WrapComponent;
