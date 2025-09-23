import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ContractionLevel = () => {
  const { t } = useTranslation();
  return (
    <EmptyState
      headerTitle={t('contractionLevel', 'Contraction level')}
      displayText={t('contractionLevel', 'Contraction level')}
      launchForm={() => {}}
    />
  );
};

export default ContractionLevel;
