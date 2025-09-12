import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

const FoetalHeartRate = () => {
  const { t } = useTranslation();

  return (
    <EmptyState
      headerTitle={t('foetalHeartRate', 'Foetal Heart Rate')}
      displayText={t('foetalHeartRate', 'Foetal Heart Rate')}
      launchForm={() => {}}
    />
  );
};

export default FoetalHeartRate;
