import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

const DashboardAnalyticsLink = () => {
  const { t } = useTranslation();

  return (
    <ConfigurableLink to={'http://localhost:8088/superset/dashboard/11/?native_filters_key=qyGypN3sBN9g7IYbvZJc51SXLyEYcONEZ3lpUuILe_22hewewKf4U_jNHRVwg9y2'}>{t('facilityDashboard', 'Facility Dashboard')}</ConfigurableLink>

  );
};

export default DashboardAnalyticsLink;
