import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

const MembraneAmnioticFluidAndMoulding = () => {
  const { t } = useTranslation();

  return (
    <EmptyState
      headerTitle={t('membraneAmnioticFluidAndMoulding', 'Membrane Amniotic Fluid & Moulding')}
      displayText={t('membraneAmnioticFluidAndMoulding', 'Membrane Amniotic Fluid & Moulding')}
      launchForm={() => {}}
    />
  );
};

export default MembraneAmnioticFluidAndMoulding;
