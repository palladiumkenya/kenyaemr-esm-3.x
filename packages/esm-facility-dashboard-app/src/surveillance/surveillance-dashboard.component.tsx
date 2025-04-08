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
  const [currFilters, setCurrFilters] = useState<SurveillanceindicatorsFilter>({
    indicator: 'getHivPositiveNotLinked',
  });

  return (
    <div>
      <FacilityDashboardHeader title={t('surveillance', 'Surveillance')} />
      <SurveillanceFilters filters={currFilters} onFiltersChange={setCurrFilters} />
      <SurveillanceSummaryCards startDate={currFilters.startdate} endDate={currFilters.endDate} />
      {currFilters.indicator === 'getHivPositiveNotLinked' && (
        <HIVPositiveNotLinkedToART startDate={currFilters.startdate} endDate={currFilters.endDate} />
      )}
      {currFilters.indicator === 'getPregnantPostpartumNotInPrep' && (
        <PBFWNotInPrep startDate={currFilters.startdate} endDate={currFilters.endDate} />
      )}
      {currFilters.indicator === 'getEligibleForVlSampleNotTaken' && (
        <DelayedEACCharts startDate={currFilters.startdate} endDate={currFilters.endDate} />
      )}
      {currFilters.indicator === 'getVirallyUnsuppressedWithoutEAC' && (
        <MissedOpportunityChart startDate={currFilters.startdate} endDate={currFilters.endDate} />
      )}
      {currFilters.indicator === 'getHeiSixToEightWeeksWithoutPCRResults' && (
        <DNAPCRPendingCharts startDate={currFilters.startdate} endDate={currFilters.endDate} />
      )}
      {currFilters.indicator === 'getHei24MonthsWithoutDocumentedOutcome' && (
        <HEIFinalOutcomesChart startDate={currFilters.startdate} endDate={currFilters.endDate} />
      )}
    </div>
  );
};

export default SurveillancelanceDashboard;
