import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FacilityDashboardConfigObject } from '../config-schema';

const Air = () => {
  const { t } = useTranslation();
  const { showAirAndReportLinks } = useConfig<FacilityDashboardConfigObject>();
  const link = '/openmrs/facilityreporting/facilityReportingHome.page';

  if (!showAirAndReportLinks) {
    return null;
  }
  return (
    <ConfigurableLink to={link} className={`cds--side-nav__link`}>
      {t('air', 'Air')}
    </ConfigurableLink>
  );
};

export default Air;
