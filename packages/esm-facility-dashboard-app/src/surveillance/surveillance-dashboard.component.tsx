import React, { useState } from 'react';
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
import { SurveillanceindicatorsFilter } from '../types';
const SurveillancelanceDashboard = () => {
  const { t } = useTranslation();
  const [currFilters, setCurrFilters] = useState<SurveillanceindicatorsFilter>({});
  return (
    <div>
      <FacilityDashboardHeader title={t('surveillance', 'Surveillance')} />
      <SurveillanceFilters filters={currFilters} onFiltersChange={setCurrFilters} />
      <SurveillanceSummaryCards />
      {currFilters.indicator === 'getHivPositiveNotLinked' && <HIVPositiveNotLinkedToART />}
      {currFilters.indicator === 'getPregnantPostpartumNotInPrep' && <PBFWNotInPrep />}
      {currFilters.indicator === 'getEligibleForVlSampleNotTaken' && <DelayedEACCharts />}
      {currFilters.indicator === 'getVirallyUnsuppressedWithoutEAC' && <MissedOpportunityChart />}
      {currFilters.indicator === 'getHeiSixToEightWeeksWithoutPCRResults' && <DNAPCRPendingCharts />}
      {currFilters.indicator === 'getHei24MonthsWithoutDocumentedOutcome' && <HEIFinalOutcomesChart />}
    </div>
  );
};

export default SurveillancelanceDashboard;
