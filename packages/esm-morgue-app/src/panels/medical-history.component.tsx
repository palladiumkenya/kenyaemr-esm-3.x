import React from 'react';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

const MedicalHistoryView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <EmptyState displayText={'medical records'} headerTitle={t('medicalHistory', 'Medical history')} />
    </div>
  );
};

export default MedicalHistoryView;
