import { launchWorkspace, showSnackbar, useConfig } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Practitioner, ProviderResponse } from '../types';
import { OverflowMenuItem, OverflowMenu, MenuItemDivider, InlineLoading } from '@carbon/react';
import {
  createProviderAttribute,
  searchHealthCareWork,
  updateProviderAttributes,
  useIdentifierTypes,
  useProviderUser,
} from '../workspace/hook/provider-form.resource';
import { disableLogin } from './overflow.resource';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../config-schema';
import { mutate } from 'swr';

type CustomActionMenuProps = {
  provider: ProviderResponse;
};

function CustomActionMenu({ provider }: CustomActionMenuProps) {
  const { user, isLoading, error } = useProviderUser(provider.uuid);
  const { t } = useTranslation();
  const [syncLoading, setSyncLoading] = useState(false);
  const { licenseNumberUuid, licenseExpiryDateUuid, providerNationalIdUuid } = useConfig<ConfigObject>();
  const { providerIdentifierTypes } = useIdentifierTypes();

  const providerNationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);

  const handleUpdateProvider = (provider: ProviderResponse) => {
    launchWorkspace('provider-register-form', {
      workspaceTitle: 'Update account form',
      provider,
      user,
    });
  };

  const handleSync = async () => {
    try {
      setSyncLoading(true);
      const healthWorker: Practitioner = await searchHealthCareWork('National id', providerNationalId.value);
      const licenseNumber =
        healthWorker?.qualification?.[0]?.extension?.find(
          (ext) => ext.url === 'https://shr.tiberbuapps.com/fhir/StructureDefinition/current-license-number',
        )?.valueString || 'Unknown';

      const updatableAttributes = [
        {
          attributeType: licenseNumberUuid,
          value: licenseNumber,
        },
      ];

      await Promise.all(
        updatableAttributes.map((attr) => {
          const _attribute = provider.attributes.find((at) => at.attributeType.uuid === attr.attributeType)?.uuid;
          if (!_attribute) {
            return createProviderAttribute(attr, provider.uuid);
          }

          return updateProviderAttributes(
            { value: attr.value },
            provider.uuid,
            provider.attributes.find((at) => at.attributeType.uuid === attr.attributeType)?.uuid,
          );
        }),
      );
      mutate((key) => {
        return typeof key === 'string' && key.startsWith('/ws/rest/v1/provider');
      });
      showSnackbar({
        title: 'Success',
        kind: 'success',
        subtitle: t('syncmsg', 'Account synced successfully!'),
      });
    } catch (err) {
      showSnackbar({
        title: 'Failure',
        kind: 'error',
        subtitle: t('errorMsg', 'Failed to sync the account'),
      });
    } finally {
      setSyncLoading(false);
    }
  };

  if (isLoading || error) {
    return null;
  }
  if (syncLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Syncing data..." />;
  }

  return (
    <OverflowMenu flipped={document?.dir === 'rtl'} aria-label="overflow-menu">
      <OverflowMenuItem itemText="Edit" onClick={() => handleUpdateProvider(provider)} />
      <MenuItemDivider />
      <OverflowMenuItem itemText="Sync" onClick={handleSync} disabled={!providerNationalId} />
    </OverflowMenu>
  );
}

export default CustomActionMenu;
