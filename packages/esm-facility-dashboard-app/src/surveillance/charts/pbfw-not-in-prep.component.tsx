import '@carbon/charts/styles.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import EmptyState from '../empty-state/empty-state-log.components';
import styles from './charts.scss';
import { InlineLoading } from '@carbon/react';
import BaseCummulativeProgressTrackingChart from './base-cummulative-progress-tracking-chart.component';

type PBFWNotInPrepProps = {
  startDate?: Date;
  endDate?: Date;
};
const PBFWNotInPrep: React.FC<PBFWNotInPrepProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const {
    error,
    isLoading,
    surveillanceSummary,
    getCompletedPercentage,
    getPendingPercentage,
    getThirtydaysRunninPercentage,
    getThirtydaysRunninPendingPercentage,
  } = useFacilityDashboardSurveillance(startDate, endDate);

  const cummulativeHighRiskPBFWNotOnPrepValueData = {
    data: [
      {
        group: 'Completed',
        value: getCompletedPercentage(
          surveillanceSummary?.getPregnantPostpartumNotInPrep,
          surveillanceSummary?.getPregnantOrPostpartumClients,
        ),
      },
      {
        group: 'Pending',
        value: getPendingPercentage(
          surveillanceSummary?.getPregnantPostpartumNotInPrep,
          surveillanceSummary?.getPregnantOrPostpartumClients,
        ),
      },
    ],
  };

  const thirtyDaysrunningData = getThirtydaysRunninPercentage(
    surveillanceSummary?.getMonthlyPregnantOrPostpartumClients.data,
    surveillanceSummary?.getMonthlyHighRiskPBFWNotOnPrep.data,
  );

  const lineGraphData = getThirtydaysRunninPendingPercentage(
    surveillanceSummary?.getMonthlyPregnantOrPostpartumClients.data,
    surveillanceSummary?.getMonthlyHighRiskPBFWNotOnPrep.data,
  );

  if (error) {
    return <EmptyState subTitle={t('errorLoadingData', 'Error loading data')} />;
  }

  return (
    <div>
      <div className={styles.chart}>
        {lineGraphData.length > 0 ? (
          <BaseIndicatorTrendChart
            data={lineGraphData}
            title={t('prepNotlinked', 'High risk +ve PBFW not on PrEP')}
            yAxisTitle={t('percentageHightRiskPBFW', '% of high risk PBFW not on PrEP')}
          />
        ) : (
          <EmptyState subTitle={t('noHighRiskPBFW', 'No high risk PBFW not on PrEP data to display')} />
        )}
      </div>
      <div className={styles.chart}>
        {thirtyDaysrunningData.length > 0 ? (
          <BaseProgressTrackingChart
            data={thirtyDaysrunningData}
            stackTitle={t('progressEnrollingHighRiskPBFWToPrEP', 'Progress enroling high risk PBFW to PrEP')}
            leftAxiTtitle={t('percentageOfPregnantOrPostpartumPatients', '% of pregnant or postpartum patients')}
          />
        ) : (
          <EmptyState subTitle={t('noHighRiskPBFW', 'No high risk PBFW not on PrEP data to display')} />
        )}
      </div>
      <br />
      <div className={styles.chart}>
        {surveillanceSummary?.getPregnantOrPostpartumClients > 0 ? (
          <div className={styles.cummulativeChart}>
            <BaseCummulativeProgressTrackingChart
              data={cummulativeHighRiskPBFWNotOnPrepValueData}
              title={t(
                'cummulativeProgressMissedoppotunityVL',
                'Cummulative progress of missed opportunity in viral load testing',
              )}
            />
          </div>
        ) : (
          <EmptyState subTitle={t('noHighRiskPBFW', 'No High risk PBFW Not on PrEP data to display')} />
        )}
      </div>
    </div>
  );
};

export default PBFWNotInPrep;
