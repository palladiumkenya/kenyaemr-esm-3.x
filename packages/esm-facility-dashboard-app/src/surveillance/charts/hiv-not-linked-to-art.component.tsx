import '@carbon/charts/styles.css';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseIndicatorTrendChart from './base-indicator-trend-chart.component';
import BaseArtProgressTrackingChart from './base-art-progress-tracking-chart.component';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import { useSurveillanceData } from '../../hooks/useSurveillanceData';
import EmptyState from '../empty-state/empty-state-log.components';
type HIVPositiveNotLinkedToARTProps = {
  startDate?: Date;
  endDate?: Date;
};
const HIVPositiveNotLinkedToART: React.FC<HIVPositiveNotLinkedToARTProps> = ({ startDate, endDate }) => {
  const { t } = useTranslation();

  const { error, isLoading, surveillanceSummary } = useFacilityDashboardSurveillance(startDate, endDate);

  const hivPositivePatientValue = useSurveillanceData(surveillanceSummary, 'getMonthlyHivPositiveNotLinked');

  const monthlyHivPositivePatientData = useSurveillanceData(
    surveillanceSummary,
    'getMonthlyHivPositiveNotLinkedPatients',
  );

  return (
    <>
      <br />
      {hivPositivePatientValue.length > 0 ? (
        <BaseIndicatorTrendChart
          data={hivPositivePatientValue}
          title={t('hivPositiveNotLinkedToART', 'HIV +VE Not linked to ART')}
          yAxisTitle={t('numberTestedPositiveNotLinked', 'Number tested positive not linked')}
        />
      ) : (
        <EmptyState subTitle={t('noHivPositiveNotLinked', 'No HIV +VE Not linked to ART data to display')} />
      )}
      <br />
      {monthlyHivPositivePatientData.length > 0 ? (
        <BaseArtProgressTrackingChart data={monthlyHivPositivePatientData} />
      ) : (
        <EmptyState subTitle={'No Linkage to ART data to display'} />
      )}
    </>
  );
};

export default HIVPositiveNotLinkedToART;
