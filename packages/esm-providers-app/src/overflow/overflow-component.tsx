import { launchWorkspace, showModal, useConfig } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { ProviderResponse } from '../types';
import { OverflowMenuItem, OverflowMenu, MenuItemDivider } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../config-schema';
import { useProviderUser } from '../workspace/hook/provider-form.resource';

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

  const isSyncEnabled = !!(providerNationalId?.value || registrationNumber?.value || passPortNumber?.value);

  const handleUpdateProvider = () => {
    launchWorkspace('provider-register-form', {
      workspaceTitle: t('updateAccountForm', 'Update account form'),
      provider,
      user,
    });
  };

  const handleOpenSyncModal = () => {
    setSyncLoading(true);
    showModal('hwr-sync-modal', { provider });
    setSyncLoading(false);
  };

  if (isLoading || error) {
    return null;
  }

  return (
    <OverflowMenu flipped={document?.dir === 'rtl'} aria-label={t('overflowMenu', 'Overflow menu')}>
      <OverflowMenuItem itemText={t('edit', 'Edit')} onClick={handleUpdateProvider} />
      <MenuItemDivider />
      <OverflowMenuItem
        itemText={t('sync', 'Sync')}
        onClick={handleOpenSyncModal}
        disabled={!isSyncEnabled || syncLoading}
      />
    </OverflowMenu>
  );
}

export default CustomActionMenu;
