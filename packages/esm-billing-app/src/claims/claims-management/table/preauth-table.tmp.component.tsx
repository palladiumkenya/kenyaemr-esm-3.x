import React from 'react';
import ClaimsTable from './claim-table.component';
import { Button } from '@carbon/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Add } from '@carbon/react/icons';

const PreauthTableTemporary: React.FC = () => {
  const handleLaunchPreAuthForm = () => {
    launchWorkspace('benefits-pre-auth-form', {
      workspaceTitle: t('preAuthForm', 'Pre Auth Form'),
    });
  };
  const { t } = useTranslation();
  return (
    <ClaimsTable
      title="preauthsRequests"
      emptyStateText="emptyPreauthState"
      emptyStateHeader="Preauth"
      includeClaimCode={false}
      use="preauthorization"
      renderActionButton={() => (
        <Button kind="primary" renderIcon={Add} onClick={handleLaunchPreAuthForm}>
          {t('addPreauthRequest', 'Add Preauth Request')}
        </Button>
      )}
    />
  );
};

export default PreauthTableTemporary;
