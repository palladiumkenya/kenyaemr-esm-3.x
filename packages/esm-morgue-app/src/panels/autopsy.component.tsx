import React from 'react';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

const AutopsyView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <EmptyState displayText={'autopsy records'} headerTitle={t('autopsyRecords', 'Autopsy records')} />
    </div>
  );
};

export default AutopsyView;
