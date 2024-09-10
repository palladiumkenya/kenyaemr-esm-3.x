import React, { useState } from 'react';
import { ContentSwitcher, Switch, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './content-switcher.scss';
import { launchWorkspace, useConfig } from '@openmrs/esm-framework';
import { Friendship } from '@carbon/react/icons';
import ProviderListTable from '../table/provider-data-table.component';
import dayjs from 'dayjs';
import { ConfigObject } from '../config-schema';
export const ContentSwitchTabs: React.FC = () => {
  const { t } = useTranslation();
  const { licenseNumberUuid, licenseExpiryDateUuid, providerNationalIdUuid } = useConfig<ConfigObject>();

  const switchTabs = [
    {
      name: t('providersWithActiveLicenses', 'Active license'),
      filter: (provider) => {
        const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
        const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
        const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
        const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;

        return nationalId && licenseAttr && licenseExpiryDate && licenseExpiryDate.isAfter(dayjs());
      },
    },
    {
      name: t('expiringedLicenses', 'Expiring(ed) licenses'),
      filter: (provider) => {
        const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
        const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
        const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
        const licenseExpiryDate = expiryAttr ? dayjs(expiryAttr.value) : null;

        return licenseAttr && nationalId && licenseExpiryDate && licenseExpiryDate.diff(dayjs(), 'day') <= 3;
      },
    },
    {
      name: t('missingNationalIDs', 'Missing national id'),
      filter: (provider) => {
        const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
        const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
        const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
        return !nationalId && !licenseAttr && !expiryAttr;
      },
    },
    {
      name: t('WithMissingLicenses', 'Missing license'),
      filter: (provider) => {
        const licenseAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseNumberUuid);
        const expiryAttr = provider.attributes.find((attr) => attr.attributeType.uuid === licenseExpiryDateUuid);
        const nationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
        return nationalId && (!licenseAttr || !expiryAttr);
      },
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleRegisterProvider = () => {
    launchWorkspace('provider-register-form', {
      workspaceTitle: 'Register account form',
    });
  };

  const handleSwitchChange = (event) => {
    setActiveIndex(event.index);
  };

  return (
    <>
      <div className={styles.contentSwitcherWrapper}>
        <div className={styles.switcherContainer}>
          <ContentSwitcher
            className={styles.contentSwitcher}
            size="lg"
            selectedIndex={activeIndex}
            onChange={handleSwitchChange}>
            {switchTabs.map((tab, index) => (
              <Switch key={index} name={tab.name} text={tab.name} />
            ))}
          </ContentSwitcher>
        </div>
        <Button
          className={styles.rightButton}
          renderIcon={Friendship}
          size="lg"
          onClick={handleRegisterProvider}
          kind="secondary">
          {t('createAnAccount', 'Create an account')}
        </Button>
      </div>

      <div className={styles.tabContent}>
        <ProviderListTable filter={switchTabs[activeIndex].filter} />
      </div>
    </>
  );
};
