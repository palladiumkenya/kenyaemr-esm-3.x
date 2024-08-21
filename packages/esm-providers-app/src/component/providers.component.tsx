import React from 'react';
import { ProvidersHeader } from '../header/providers-header.component';
import ProvidersMetrics from '../providers-metrics/providers-metrics.component';
import { ProvidersTabs } from '../providers-tabs/providers-tabs-component';
import { ContentSwitchTabs } from '../content-switcher/content-switcher.component';

const ProvidersComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ProvidersHeader title={'Providers'} />
      <ContentSwitchTabs />
      {/* <ProvidersMetrics /> */}
      <ProvidersTabs />
    </div>
  );
};

export default ProvidersComponent;
