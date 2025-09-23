import { EmptyState } from '@openmrs/esm-patient-common-lib/src';
import React from 'react';
import { useTranslation } from 'react-i18next';

const CervicalDilation = () => {
  const { t } = useTranslation();
  return (
    <EmptyState
      headerTitle={t('cervicalDilation', 'Cervical Dilation')}
      displayText={t('cervicalDilation', 'Cervical Dilation')}
      launchForm={() => {}}
    />
  );
};

export default CervicalDilation;
