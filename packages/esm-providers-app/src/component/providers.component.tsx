import React from 'react';
import { ProvidersHeader } from '../header/providers-header.component';
import { ContentSwitchTabs } from '../content-switcher/content-switcher.component';

const ProvidersComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ProvidersHeader title={'Providers'} />
      <ContentSwitchTabs />
    </div>
  );
};

export default ProvidersComponent;
