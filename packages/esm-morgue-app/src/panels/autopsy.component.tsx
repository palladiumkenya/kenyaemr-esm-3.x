import React from 'react';
import { ExtensionSlot, launchWorkspace, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

const AutopsyView: React.FC = () => {
  const { t } = useTranslation();

  const handleLaunchBillForm = () => {
    launchWorkspace('autopsy-form', {
      workspaceTitle: 'Autopsy entry form',
    });
  };

  return (
    <div>
      <EmptyState
        displayText={'autopsy records'}
        headerTitle={t('autopsyRecords', 'Autopsy records')}
        launchForm={handleLaunchBillForm}
      />
    </div>
  );
};

export default AutopsyView;
