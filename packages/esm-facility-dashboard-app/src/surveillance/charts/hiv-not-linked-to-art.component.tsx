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
type HIVPositiveNotLinkedToARTProps = {
  startDate?: Date;
  endDate?: Date;
};
const HIVPositiveNotLinkedToART: React.FC<HIVPositiveNotLinkedToARTProps> = ({ startDate, endDate }) => {
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

  const notLinkedToArtData = getThirtydaysRunninPercentage(
    surveillanceSummary?.getMonthlyPatientsTestedHivPositive.data,
    surveillanceSummary?.getMonthlyHivPositiveNotLinkedPatients.data,
  );

  const lineGraphData = getThirtydaysRunninPendingPercentage(
    surveillanceSummary?.getMonthlyPatientsTestedHivPositive.data,
    surveillanceSummary?.getMonthlyHivPositiveNotLinkedPatients.data,
  );

  if (error) {
    return <EmptyState subTitle={t('errorLoadingData', 'Error loading data')} />;
  }

  return (
    <div className={styles.chartContainer}>
      {isLoading ? (
        <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
      ) : (
        <div className={styles.chartContainer}>
          <div className={styles.chart}>
            {lineGraphData.length > 0 ? (
              <BaseIndicatorTrendChart
                data={lineGraphData}
                title={t('hivPositiveNotLinkedToART', 'HIV +VE Not linked to ART')}
                yAxisTitle={t('percentageTestedPositiveNotLinked', '% tested positive not linked')}
              />
            ) : (
              <EmptyState subTitle={t('noHivPositiveNotLinked', 'No HIV +VE Not linked to ART data to display')} />
            )}
          </div>
          <div className={styles.chart}>
            {notLinkedToArtData.length > 0 ? (
              <BaseProgressTrackingChart
                data={notLinkedToArtData}
                stackTitle={t('progressInAddressingLinkedToArt', 'Progress in addressing Linkage to ART')}
                leftAxiTtitle={t('percentageHivPositive', '% HIV positive')}
              />
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
                  yAxisTitle={t('percentageHivPositive', '% HIV positive')}
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
        </div>
      )}
    </div>
  );
};

export default HIVPositiveNotLinkedToART;
