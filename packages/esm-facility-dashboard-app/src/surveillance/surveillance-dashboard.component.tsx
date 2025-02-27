import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveillanceHeader from './header/header.component';
import SurveillanceSummaryCards from './summary-cards/surveillance-summary-cards.component';
import SurveillanceFilters from './surveillance-filters.component';
const SurveillancelanceDashboard = () => {
  const { t } = useTranslation();
  return (
    <div>
      <SurveillanceHeader title={t('surveillance', 'Surveillance')} />
      <SurveillanceFilters />
      <SurveillanceSummaryCards />
    </div>
  );
};

export default SurveillancelanceDashboard;
