import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveillanceSummaryCards from './summary-cards/surveillance-summary-cards.component';
import SurveillanceFilters from './surveillance-filters.component';
import FacilityDashboardHeader from '../components/header/header.component';
import HIVPositiveNotLinkedToART from './charts/hiv-not-linked-to-art.component';
import ProgressTracking from './charts/base-progress-tracking-chart.component';
import HIVProgressChart from './charts/hiv-progress';
const SurveillancelanceDashboard = () => {
  const { t } = useTranslation();
  return (
    <div>
      <FacilityDashboardHeader title={t('surveillance', 'Surveillance')} />
      <SurveillanceFilters />
      <SurveillanceSummaryCards />
      <HIVPositiveNotLinkedToART />
      <HIVProgressChart />
    </div>
  );
};

export default SurveillancelanceDashboard;
