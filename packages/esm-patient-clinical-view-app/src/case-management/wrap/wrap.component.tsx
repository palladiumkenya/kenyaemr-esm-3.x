import React, { useState, useCallback } from 'react';
import { ClaimManagementHeader } from '../header/case-management-header';
import CaseMetric from '../metrics/case-management-metric.component';
import CaseManagementTabs from '../tabs/case-management-tabs.component';

const WrapComponent: React.FC = () => {
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [inactiveCasesCount, setInactiveCasesCount] = useState(0);

  const memoizedSetActiveCasesCount = useCallback((count) => setActiveCasesCount(count), []);
  const memoizedSetInactiveCasesCount = useCallback((count) => setInactiveCasesCount(count), []);

  return (
    <div className={`omrs-main-content`}>
      <ClaimManagementHeader title={'Home'} />
      <CaseMetric activeCasesCount={activeCasesCount} inactiveCasesCount={inactiveCasesCount} />
      <CaseManagementTabs
        setActiveCasesCount={memoizedSetActiveCasesCount}
        setInactiveCasesCount={memoizedSetInactiveCasesCount}
      />
    </div>
  );
};

export default WrapComponent;
