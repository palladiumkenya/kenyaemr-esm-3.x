import React from 'react';
import { useTranslation } from 'react-i18next';
import FacilityDashboardHeader from '../components/header/header.component';
import HIVPositiveNotLinkedToART from './charts/hiv-not-linked-to-art.component';
import PBFWNotInPrep from './charts/pbfw-not-in-prep.component';
import SurveillanceSummaryCards from './summary-cards/surveillance-summary-cards.component';
import SurveillanceFilters from './surveillance-filters.component';
import DelayedEACCharts from './charts/delayed-eac-charts.component';
import MissedOpportunityChart from './charts/missed-opportunity-vl-chart.component';
import DNAPCRPendingCharts from './charts/dna-pcr-pending-chart.component';
import HEIFinalOutcomesChart from './charts/hei-final-outcome.component';
const SurveillancelanceDashboard = () => {
  const { t } = useTranslation();
  return (
    <div>
      <FacilityDashboardHeader title={t('surveillance', 'Surveillance')} />
      <SurveillanceFilters />
      <SurveillanceSummaryCards />
      <HIVPositiveNotLinkedToART />
      <PBFWNotInPrep />
      <DelayedEACCharts />
      <MissedOpportunityChart />
      <DNAPCRPendingCharts />
      <HEIFinalOutcomesChart />
    </div>
  );
};

export default SurveillancelanceDashboard;
