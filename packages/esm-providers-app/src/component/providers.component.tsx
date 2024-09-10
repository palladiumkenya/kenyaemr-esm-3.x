import React from 'react';
import { ProvidersHeader } from '../header/providers-header.component';
import { ContentSwitchTabs } from '../content-switcher/content-switcher.component';
import { useProviders } from '../table/provider-data-table.resource';
import dayjs from 'dayjs';
import { ConfigObject } from '../config-schema';
import { useConfig } from '@openmrs/esm-framework';

const ProvidersComponent: React.FC = () => {
  const { provider, error, isLoading } = useProviders();
  const { licenseNumberUuid, licenseExpiryDateUuid, providerNationalIdUuid } = useConfig<ConfigObject>();

  const activeProviders = provider.filter((provider) => {
    const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
    const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
    const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
    const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;

    return nationalId && licenseAttr && licenseExpiryDate && licenseExpiryDate.isAfter(dayjs());
  });

  const expiredProviders = provider.filter((provider) => {
    const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
    const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;

    return licenseExpiryDate && licenseExpiryDate.isBefore(dayjs());
  });

  const missingNationalId = provider.filter((provider) => {
    const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
    return !nationalId;
  });
  const missingLicenseOrExpiry = provider.filter((provider) => {
    const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
    const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
    const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);

    return nationalId && (!licenseAttr || !expiryAttr);
  });
  const summarize = {
    all: provider.length,
    active: activeProviders.length,
    expired: expiredProviders.length,
    missingNationalId: missingNationalId.length,
    missingLicenseOrExpiry: missingLicenseOrExpiry.length,
  };
  return (
    <div className={`omrs-main-content`}>
      <ProvidersHeader title={'Providers'} summarize={summarize} />
      <ContentSwitchTabs />
    </div>
  );
};

export default ProvidersComponent;
