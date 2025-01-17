import { Button } from '@carbon/react';
import { Friendship } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ProviderListTable from '../table/provider-data-table.component';
import styles from './provider-overview.scss';
export const ProviderOverview: React.FC = () => {
  const { t } = useTranslation();

  const handleRegisterProvider = () => {
    launchWorkspace('provider-register-form', {
      workspaceTitle: 'Register account form',
    });
  };

  return (
    <>
      <div className={styles.contentSwitcherWrapper}>
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
        <ProviderListTable />
      </div>
    </>
  );
};
