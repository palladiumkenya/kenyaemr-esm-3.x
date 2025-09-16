import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

const DescentOfHead = () => {
  const { t } = useTranslation();
  return (
    <EmptyState
      headerTitle={t('descentOfHead', 'Descent of Head')}
      displayText={t('descentOfHead', 'Descent of Head')}
      launchForm={() => {}}
    />
  );
};

export default DescentOfHead;
