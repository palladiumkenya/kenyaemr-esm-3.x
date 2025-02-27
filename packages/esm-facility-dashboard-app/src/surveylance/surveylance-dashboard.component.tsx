import React from 'react';
import { PageHeader } from '@openmrs/esm-framework';
import SurveylanceIllustration from './header/header-illustration.component';
import { ChartColumn } from '@carbon/react/icons';
import SurveylanceHeader from './header/header.component';
import { useTranslation } from 'react-i18next';
const SurveylanceDashboard = () => {
  const { t } = useTranslation();
  return (
    <div>
      <SurveylanceHeader title={t('surveylance', 'Surveylance')} />
    </div>
  );
};

export default SurveylanceDashboard;
