import React from 'react';
import { ProvidersHeader } from '../header/providers-header.component';
import { ProviderOverview } from '../overview/provider-overview.component';

const ProvidersComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ProvidersHeader />
      <ProviderOverview />
    </div>
  );
};

export default ProvidersComponent;
