import React from 'react';
import { ProvidersHeader } from '../providers-header/providers-header.component';
import ProvidersMetrics from '../providers-metrics/providers-metrics.component';
import { ProvidersTabs } from '../providers-tabs/providers-tabs-component';

const ProvidersComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ProvidersHeader title={'Providers'} />
      <ProvidersMetrics />
      <ProvidersTabs />
    </div>
  );
};

export default ProvidersComponent;
