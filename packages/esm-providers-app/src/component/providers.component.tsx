import React from 'react';
import { ProvidersHeader } from '../header/providers-header.component';
import { useProviders } from '../table/provider-data-table.resource';
import dayjs from 'dayjs';
import { ConfigObject } from '../config-schema';
import { useConfig } from '@openmrs/esm-framework';
import { Overview } from '../overview/overview.component';

const ProvidersComponent: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ProvidersHeader />
      <Overview />
    </div>
  );
};

export default ProvidersComponent;
