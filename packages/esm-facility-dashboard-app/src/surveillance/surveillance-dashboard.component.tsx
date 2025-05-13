import React, { useMemo, useState } from 'react';
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
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { formattedDate, thirtyDays, today } from '../constants';
const SurveillancelanceDashboard = () => {
  const { t } = useTranslation();
  const [currFilters, setCurrFilters] = useState<SurveillanceindicatorsFilter>({
    indicator: 'getHivPositiveNotLinked',
  });
  const [activeTab, setActiveTab] = useState(0);
  const defaultStartDate = useMemo(() => new Date(thirtyDays()), []);
  const defaultEndDate = useMemo(() => new Date(today()), []);

  return (
    <div>
      <FacilityDashboardHeader title={t('surveillance', 'Surveillance')} />

      <Tabs onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}>
        <TabList>
          <Tab>{t('realTimeGapReview', 'Realtime gap review')}</Tab>
          <Tab>{t('progressTracker', 'Progress tracker')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <>
              <SurveillanceFilters filters={currFilters} onFiltersChange={setCurrFilters} tabSelected={activeTab} />
              <SurveillanceSummaryCards startDate={currFilters.startdate} endDate={currFilters.endDate} />
            </>
          </TabPanel>
          <TabPanel>
            <>
              <SurveillanceFilters filters={currFilters} onFiltersChange={setCurrFilters} tabSelected={activeTab} />
              {currFilters.indicator === 'getHivPositiveNotLinked' && (
                <HIVPositiveNotLinkedToART startDate={defaultStartDate} endDate={defaultEndDate} />
              )}
              {currFilters.indicator === 'getPregnantPostpartumNotInPrep' && (
                <PBFWNotInPrep startDate={defaultStartDate} endDate={defaultEndDate} />
              )}
              {currFilters.indicator === 'getEligibleForVlSampleNotTaken' && (
                <DelayedEACCharts startDate={defaultStartDate} endDate={defaultEndDate} />
              )}
              {currFilters.indicator === 'getVirallyUnsuppressedWithoutEAC' && (
                <MissedOpportunityChart startDate={defaultStartDate} endDate={defaultEndDate} />
              )}
              {currFilters.indicator === 'getHeiSixToEightWeeksWithoutPCRResults' && (
                <DNAPCRPendingCharts startDate={defaultStartDate} endDate={defaultEndDate} />
              )}
              {currFilters.indicator === 'getHei24MonthsWithoutDocumentedOutcome' && (
                <HEIFinalOutcomesChart startDate={defaultStartDate} endDate={defaultEndDate} />
              )}
            </>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default SurveillancelanceDashboard;
