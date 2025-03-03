import React from 'react';
import FacilityDashboardHeader from '../components/header/header.component';
import { useTranslation } from 'react-i18next';

const AboveSiteDashboard = () => {
  const { t } = useTranslation();
  return (
    <div>
      <FacilityDashboardHeader title={t('aboveSiteDashboard', 'Above site facility Dashboard')} />
    </div>
  );
};

export default AboveSiteDashboard;
