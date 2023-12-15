import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';

const DashboardAnalyticsLink = () => {
  const { t } = useTranslation();
  const { facilityDashboardUrl } = useConfig<ConfigObject>();

  return <ConfigurableLink to={facilityDashboardUrl}>{t('facilityDashboard', 'Facility Dashboard')}</ConfigurableLink>;
};

export default DashboardAnalyticsLink;
