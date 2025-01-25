import { launchWorkspace, showModal, showSnackbar, useConfig } from '@openmrs/esm-framework';
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
  const { providerNationalIdUuid, licenseBodyUuid, passportNumberUuid } = useConfig<ConfigObject>();

  const providerNationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
  const registrationNumber = provider.attributes.find((attr) => attr.attributeType.uuid === licenseBodyUuid);
  const passPortNumber = provider.attributes.find((attr) => attr.attributeType.uuid === passportNumberUuid);

  // Check if any of the attributes has a value
  const canSync = !!(providerNationalId?.value || registrationNumber?.value || passPortNumber?.value);

  if (isLoading) {
    return null;
  }

  const handleUpdateProvider = (provider: ProviderResponse) => {
    launchWorkspace('provider-register-form', {
      workspaceTitle: 'Update account form',
      provider,
      user,
    });
  };

  const handleOpenModal = () => {
    setSyncLoading(true);
    showModal('hwr-sync-modal', { provider });
    setSyncLoading(false);
  };

  if (isLoading || error) {
    return null;
  }

  return (
    <OverflowMenu flipped={document?.dir === 'rtl'} aria-label="overflow-menu">
      <OverflowMenuItem itemText="Edit" onClick={() => handleUpdateProvider(provider)} />
      <MenuItemDivider />
      <OverflowMenuItem itemText="Sync" onClick={handleOpenModal} disabled={!canSync} />
    </OverflowMenu>
  );
}

export default CustomActionMenu;
