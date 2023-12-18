import React from 'react';
import { Button } from '@carbon/react';
import { Home } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { usePatientId } from '../hooks/usePatientId';
import { navigate } from '@openmrs/esm-framework';

const KenyaEMRChartLink = () => {
  const { t } = useTranslation();
  const [, , , , patientUuid] = window.location.pathname.split('/');
  const { isLoading, patient } = usePatientId(patientUuid);

  return (
    <Button
      onClick={() => navigate({ to: `/openmrs/kenyaemr/chart/chartViewPatient.page?patientId=${patient?.patientId}&` })}
      renderIcon={Home}
      style={{ margin: ' 0 0.25rem' }}>
      {t('2xChart', '2.x Chart')}
    </Button>
  );
};

export default KenyaEMRChartLink;
