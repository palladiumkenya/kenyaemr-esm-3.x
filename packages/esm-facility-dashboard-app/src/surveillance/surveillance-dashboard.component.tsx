import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveillanceSummaryCards from './summary-cards/surveillance-summary-cards.component';
import SurveillanceFilters from './surveillance-filters.component';
import FacilityDashboardHeader from '../components/header/header.component';
const SurveillancelanceDashboard = () => {
  const { t } = useTranslation();
  return (
    <div>
      <FacilityDashboardHeader title={t('surveillance', 'Surveillance')} />
      <SurveillanceFilters />
      <SurveillanceSummaryCards />
    </div>
  );
};

export default SurveillancelanceDashboard;
