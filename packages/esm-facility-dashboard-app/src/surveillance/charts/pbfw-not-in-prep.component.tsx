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

type PBFWNotInPrepProps = {
  startDate?: Date;
  endDate?: Date;
};
const PBFWNotInPrep: React.FC<PBFWNotInPrepProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary } = useFacilityDashboardSurveillance(startDate, endDate);
  const highRiskPBFWNotOnPrepValue = useSurveillanceData(surveillanceSummary, 'getMonthlyHighRiskPBFWNotOnPrep');

  const monthlyhighRiskPBFWNotOnPrepPatientData = useSurveillanceData(
    surveillanceSummary,
    'getMonthlyHighRiskPBFWNotOnPrepPatients',
  );

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
        </>
      )}
    </div>
  );
};

export default PBFWNotInPrep;
