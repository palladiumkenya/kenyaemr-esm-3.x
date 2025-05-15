import '@carbon/charts/styles.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseProgressTrackingChart from './base-progress-tracking-chart.component';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
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
  const { error, isLoading, surveillanceSummary, getCompletedPercentage, getPendingPercentage } =
    useFacilityDashboardSurveillance(startDate, endDate);
  const highRiskPBFWNotOnPrepValue = useSurveillanceData(surveillanceSummary, 'getMonthlyHighRiskPBFWNotOnPrep');

  const monthlyhighRiskPBFWNotOnPrepPatientData = useSurveillanceData(
    surveillanceSummary,
    'getMonthlyHighRiskPBFWNotOnPrepPatients',
  );

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

  return (
    <div>
      {isLoading ? (
        <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
      ) : (
        <>
          <div className={styles.chart}>
            {highRiskPBFWNotOnPrepValue.length > 0 ? (
              <BaseIndicatorTrendChart
                data={highRiskPBFWNotOnPrepValue}
                title={t('prepNotlinked', 'High risk +ve PBFW not on PrEP')}
                yAxisTitle={t('numberHightRiskPBFW', 'Number of High risk PBFW Not on PrEP')}
              />
            ) : (
              <EmptyState subTitle={t('noHighRiskPBFW', 'No High risk PBFW Not on PrEP data to display')} />
            )}
          </div>
          <div className={styles.chart}>
            {monthlyhighRiskPBFWNotOnPrepPatientData.length > 0 ? (
              <BaseProgressTrackingChart data={monthlyhighRiskPBFWNotOnPrepPatientData} />
            ) : (
              <EmptyState subTitle={t('noHighRiskPBFW', 'No High risk PBFW Not on PrEP data to display')} />
            )}
          </div>
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
        </>
      )}
    </div>
  );
};

export default PBFWNotInPrep;
