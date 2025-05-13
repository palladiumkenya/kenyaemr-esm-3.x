import '@carbon/charts/styles.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseArtProgressTrackingChart from './base-art-progress-tracking-chart.component';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
import EmptyState from '../empty-state/empty-state-log.components';
import styles from './charts.scss';
import { InlineLoading } from '@carbon/react';
import BaseCummulativeProgressTrackingChart from './base-cummulative-progress-tracking-chart.component';
type HIVPositiveNotLinkedToARTProps = {
  startDate?: Date;
  endDate?: Date;
};
const HIVPositiveNotLinkedToART: React.FC<HIVPositiveNotLinkedToARTProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();

  const { error, isLoading, surveillanceSummary, getCompletedPercentage, getPendingPercentage } =
    useFacilityDashboardSurveillance(startDate, endDate);

  const hivPositivePatientValue = useSurveillanceData(surveillanceSummary, 'getMonthlyHivPositiveNotLinked');

  const monthlyHivPositivePatientData = useSurveillanceData(
    surveillanceSummary,
    'getMonthlyHivPositiveNotLinkedPatients',
  );

  const cummulativeHivPositivePatientData = {
    data: [
      {
        group: 'Completed',
        value: getCompletedPercentage(
          surveillanceSummary?.getHivPositiveNotLinked,
          surveillanceSummary?.getHivTestedPositive,
        ),
      },
      {
        group: 'Pending',
        value: getPendingPercentage(
          surveillanceSummary?.getHivPositiveNotLinked,
          surveillanceSummary?.getHivTestedPositive,
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
            {hivPositivePatientValue.length > 0 ? (
              <BaseIndicatorTrendChart
                data={hivPositivePatientValue}
                title={t('hivPositiveNotLinkedToART', 'HIV +VE Not linked to ART')}
                yAxisTitle={t('numberTestedPositiveNotLinked', 'Number tested positive not linked')}
              />
            ) : (
              <EmptyState subTitle={t('noHivPositiveNotLinked', 'No HIV +VE Not linked to ART data to display')} />
            )}
          </div>
          <div className={styles.chart}>
            {monthlyHivPositivePatientData.length > 0 ? (
              <BaseArtProgressTrackingChart data={monthlyHivPositivePatientData} />
            ) : (
              <EmptyState subTitle={'No Linkage to ART data to display'} />
            )}
          </div>
          <div className={styles.chart}>
            {surveillanceSummary?.getHivTestedPositive > 0 ? (
              <div className={styles.cummulativeChart}>
                <BaseCummulativeProgressTrackingChart
                  data={cummulativeHivPositivePatientData}
                  title={t(
                    'cummulativeProgressOfAddressingLinkedToArt',
                    'Cummulative progress of addressing Linkage to ART',
                  )}
                />
              </div>
            ) : (
              <EmptyState
                subTitle={t(
                  'noCummulativeHivPositiveNotLinked',
                  'No cummulative HIV +VE Not linked to ART data to display',
                )}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HIVPositiveNotLinkedToART;
